import os
import sys
import argparse
import subprocess
from typing import List
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.test import TestModel

# Define structured output model
class AgentExecutionResult(BaseModel):
    thoughts: str = Field(description="The internal thinking process of the agent.")
    actions: List[str] = Field(description="List of actions executed by the agent.")
    success: bool = Field(description="Flag indicating whether the task was fully achieved.")
    rca_capa: str = Field(description="Root Cause Analysis (RCA) and Corrective Actions (CAPA) logs for this execution.")

# Load system rules from wiki if available
def load_system_rules() -> str:
    rules_path = os.path.join("wiki", "global_rules.md")
    default_prompt = (
        "You are the senior full-stack architect & art director agent for SkillsBuilder. "
        "Your mission is to perform surgical code updates, verify integrity via verify.ps1, "
        "and maintain absolute code hygiene and PDCA discipline."
    )
    if os.path.exists(rules_path):
        try:
            with open(rules_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            print(f"Warning: Failed to read global_rules.md ({e}), using default.", file=sys.stderr)
    return default_prompt

# Setup PydanticAI Agent
rules = load_system_rules()
# We initialize the agent. The actual model will be determined at runtime.
agent = Agent(
    model='google:gemini-1.5-flash', # Default model identifier, can be overridden
    output_type=AgentExecutionResult,
    system_prompt=rules
)

# Register plain tools
@agent.tool_plain
def run_verify() -> str:
    """
    Run verify.ps1 to validate workspace integrity and check for errors.
    Always run this after modifications to ensure everything passes validation.
    """
    try:
        # Determine shell environment based on OS
        shell_cmd = ["powershell", "-ExecutionPolicy", "Bypass", "-File", "verify.ps1"]
        if os.name != "nt":
            shell_cmd = ["./verify.ps1"]
            
        result = subprocess.run(
            shell_cmd,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore"
        )
        return (
            f"Exit Code: {result.returncode}\n"
            f"STDOUT:\n{result.stdout}\n"
            f"STDERR:\n{result.stderr}"
        )
    except Exception as e:
        return f"Failed to run verify.ps1: {e}"

@agent.tool_plain
def run_command(cmd: str) -> str:
    """
    Run a safe local command in the repository workspace.
    Allowed commands are: graphify, npx gitnexus, npx skills, npm run.
    """
    # Simple whitelist validation for safety
    allowed_prefixes = ["graphify", "npx gitnexus", "npx skills", "npm run", "git status"]
    if not any(cmd.strip().startswith(p) for p in allowed_prefixes):
        return f"Error: Command '{cmd}' is blocked by security policy. Only repository tool commands are allowed."
        
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="ignore"
        )
        return (
            f"Exit Code: {result.returncode}\n"
            f"STDOUT:\n{result.stdout}\n"
            f"STDERR:\n{result.stderr}"
        )
    except Exception as e:
        return f"Failed to execute command '{cmd}': {e}"

def main():
    parser = argparse.ArgumentParser(description="SkillsBuilder PydanticAI Agent Runner")
    parser.add_argument("prompt", nargs="?", default="Verify the workspace integrity and report status.", help="The task prompt for the agent.")
    parser.add_argument("--test", action="store_true", help="Run in mock/test mode using TestModel (no API key required).")
    parser.add_argument("--model", default=None, help="Override default Gemini model (e.g. google:gemini-1.5-pro).")
    args = parser.parse_args()

    # Determine model to use
    selected_model = args.model or os.environ.get("AGENT_MODEL") or 'google:gemini-1.5-flash'
    
    if args.test:
        print("[INFO] Running in mock/test mode using PydanticAI TestModel...")
        # Override agent model with TestModel
        test_agent = Agent(
            model=TestModel(),
            output_type=AgentExecutionResult,
            system_prompt=rules
        )
        # Register the same tools
        test_agent.tool_plain(run_verify)
        test_agent.tool_plain(run_command)
        
        # Test run
        print(f"[INFO] Executing prompt: '{args.prompt}'")
        result = test_agent.run_sync(args.prompt)
        print("\n=== Agent Executed Successfully (Mocked Output) ===")
        print(f"Thoughts: {result.output.thoughts}")
        print(f"Actions taken: {result.output.actions}")
        print(f"Success status: {result.output.success}")
        print(f"RCA/CAPA log: {result.output.rca_capa}")
        sys.exit(0)

    # Production run check
    # Check if necessary API keys are configured
    has_api_key = any(k in os.environ for k in ["GEMINI_API_KEY", "GOOGLE_API_KEY", "OPENAI_API_KEY"])
    if not has_api_key:
        print("[ERROR] Missing API Key. Please configure GEMINI_API_KEY or GOOGLE_API_KEY.", file=sys.stderr)
        print("[INFO] You can run in test mode with --test: python tools/agent_runner.py --test", file=sys.stderr)
        sys.exit(1)

    print(f"[INFO] Initializing Agent with model '{selected_model}'...")
    agent.model = selected_model # Set runtime model choice
    print(f"[INFO] Executing prompt: '{args.prompt}'")
    
    try:
        result = agent.run_sync(args.prompt)
        print("\n=== Agent Execution Result ===")
        print(f"Success: {result.output.success}")
        print(f"Thoughts:\n{result.output.thoughts}")
        print(f"Actions:\n{', '.join(result.output.actions)}")
        print(f"RCA/CAPA:\n{result.output.rca_capa}")
    except Exception as e:
        print(f"[FATAL] Agent failed during execution: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
