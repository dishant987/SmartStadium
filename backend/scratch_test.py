import asyncio
from app.services.langgraph_agent import LangGraphAgent

async def main():
    agent = LangGraphAgent()
    print("Testing respond_stream:")
    async for token in agent.respond_stream([{"role": "user", "content": "hello"}]):
        print(f"Token: {repr(token)}")

if __name__ == "__main__":
    asyncio.run(main())
