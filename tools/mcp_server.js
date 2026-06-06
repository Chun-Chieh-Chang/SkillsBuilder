import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
  return {
    tools: TOOLS,
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

  switch (name) {
    case "graphify_query": {
      const escapedQuery = args.query.replace(/"/g, '\\"');
      return await runCommand(`graphify query "${escapedQuery}"`);
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
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SkillsBuilder MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
