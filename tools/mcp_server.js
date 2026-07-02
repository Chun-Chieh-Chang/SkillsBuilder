import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

// Path to codebase-memory-mcp.exe
const cbmPath = path.join(process.cwd(), "tools", "codebase-memory-mcp.exe");

let childProcess = null;
let childTools = [];
const pendingRequests = new Map();
let nextRequestId = 1;

function initChildProcess() {
  if (!fs.existsSync(cbmPath)) {
    console.error(`[SkillsBuilder] codebase-memory-mcp.exe not found at: ${cbmPath}`);
    return;
  }

  console.error(`[SkillsBuilder] Spawning codebase-memory-mcp.exe...`);
  childProcess = spawn(cbmPath, ["--ui=true"], { stdio: ["pipe", "pipe", "inherit"] });

  let buffer = "";
  childProcess.stdout.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim()) {
        try {
          const message = JSON.parse(line);
          if (message.id !== undefined) {
            const callback = pendingRequests.get(message.id);
            if (callback) {
              pendingRequests.delete(message.id);
              if (message.error) {
                callback.reject(message.error);
              } else {
                callback.resolve(message.result);
              }
            }
          }
        } catch (err) {
          console.error("[SkillsBuilder] Error parsing JSON from child:", err);
        }
      }
    }
  });

  childProcess.on("error", (err) => {
    console.error("[SkillsBuilder] child process error:", err);
    childProcess = null;
  });

  childProcess.on("exit", (code) => {
    console.error(`[SkillsBuilder] child process exited with code ${code}`);
    childProcess = null;
  });

  // Perform initialization handshake with the child server
  sendRequest("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "skillsbuilder-mcp-proxy",
      version: "1.0.0"
    }
  })
    .then(() => {
      console.error("[SkillsBuilder] codebase-memory-mcp initialized successfully.");
      sendNotification("notifications/initialized", {});
      return sendRequest("tools/list", {});
    })
    .then((result) => {
      if (result && result.tools) {
        childTools = result.tools;
        console.error(`[SkillsBuilder] Loaded ${childTools.length} tools from codebase-memory-mcp.`);
      }
    })
    .catch((err) => {
      console.error("[SkillsBuilder] Failed to initialize codebase-memory-mcp:", err);
    });
}

function sendRequest(method, params) {
  return new Promise((resolve, reject) => {
    if (!childProcess) {
      return reject(new Error("codebase-memory-mcp is not running"));
    }
    const id = nextRequestId++;
    const message = {
      jsonrpc: "2.0",
      id,
      method,
      params
    };
    pendingRequests.set(id, { resolve, reject });
    childProcess.stdin.write(JSON.stringify(message) + "\n");
  });
}

function sendNotification(method, params) {
  if (!childProcess) return;
  const message = {
    jsonrpc: "2.0",
    method,
    params
  };
  childProcess.stdin.write(JSON.stringify(message) + "\n");
}

// Initialize MCP Server
const server = new Server(
  {
    name: "skillsbuilder-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools list
const TOOLS = [
  {
    name: "graphify_query",
    description: "Query the local knowledge graph of the project to understand dependencies or cross-component logic with low token cost.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The natural language query or question about the codebase structure/relationships.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "invoke_sb_tool",
    description: "Execute a SkillsBuilder Python or PowerShell script from the tools/ directory.",
    inputSchema: {
      type: "object",
      properties: {
        script_name: {
          type: "string",
          description: "Name of the script in the tools directory (e.g. 'understand_bridge.py', 'sb.ps1').",
        },
        args: {
          type: "string",
          description: "Arguments to pass to the script.",
        }
      },
      required: ["script_name"],
    },
  },
  {
    name: "graphify_update",
    description: "Update the project's local knowledge graph incrementally to reflect recent code modifications.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "gitnexus_query",
    description: "Perform gitnexus queries for impact analysis, tracing call chains, or finding semantic references.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The query string (e.g. 'impact_analysis(symbol: \"SYMBOL_NAME\")' or 'find_references(symbol: \"SYMBOL_NAME\")').",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "gitnexus_analyze",
    description: "Analyze and rebuild the GitNexus knowledge graph for the codebase.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "verify_workspace",
    description: "Run the local workspace software validation script to ensure no linter errors or broken links.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  }
];

// Register list of tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  let combinedTools = [...TOOLS];
  if (childProcess) {
    try {
      const result = await sendRequest("tools/list", {});
      if (result && result.tools) {
        childTools = result.tools;
      }
    } catch (err) {
      console.error("[SkillsBuilder] Error listing tools from child:", err);
    }
  }
  return {
    tools: [...combinedTools, ...childTools],
  };
});

// Helper for executing commands
async function runCommand(cmd) {
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: process.cwd() });
    return {
      content: [
        {
          type: "text",
          text: `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Command failed: ${cmd}\nError: ${error.message}\nSTDOUT: ${error.stdout || ""}\nSTDERR: ${error.stderr || ""}`,
        },
      ],
    };
  }
}

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Check if it's one of codebase-memory-mcp's tools
  const isChildTool = childTools.some((t) => t.name === name);
  if (isChildTool) {
    try {
      const response = await sendRequest("tools/call", {
        name,
        arguments: args,
      });
      return response;
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Proxy error calling tool ${name}: ${err.message || JSON.stringify(err)}`,
          },
        ],
      };
    }
  }

  switch (name) {
    case "graphify_query": {
      const escapedQuery = args.query.replace(/"/g, '\\"');
      return await runCommand(`graphify query "${escapedQuery}"`);
    }
    case "invoke_sb_tool": {
      const scriptName = args.script_name;
      const scriptArgs = args.args || "";
      const scriptPath = path.join(process.cwd(), "tools", scriptName);
      if (!fs.existsSync(scriptPath)) {
        throw new Error(`Tool script not found: ${scriptPath}`);
      }
      let cmd = "";
      if (scriptName.endsWith(".py")) {
        cmd = `python "${scriptPath}" ${scriptArgs}`;
      } else if (scriptName.endsWith(".ps1")) {
        cmd = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" ${scriptArgs}`;
      } else {
        throw new Error(`Unsupported script type: ${scriptName}`);
      }
      return await runCommand(cmd);
    }
    case "graphify_update": {
      return await runCommand("graphify . --update");
    }
    case "gitnexus_query": {
      const escapedQuery = args.query.replace(/"/g, '\\"');
      return await runCommand(`npx gitnexus query "${escapedQuery}"`);
    }
    case "gitnexus_analyze": {
      return await runCommand("npx gitnexus analyze");
    }
    case "verify_workspace": {
      // Run the powershell validation script
      return await runCommand("powershell -ExecutionPolicy Bypass -File verify.ps1");
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Run the server using stdio transport
async function main() {
  initChildProcess();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SkillsBuilder MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
