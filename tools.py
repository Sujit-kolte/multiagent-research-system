from langchain.tools import tool
import requests
import time
from bs4 import BeautifulSoup
from tavily import TavilyClient
import os
from dotenv import load_dotenv
from rich import print

load_dotenv()
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


@tool
def web_search(query: str) -> str:
    """
    Search the web using Tavily and return the title, snippet and URL
    of the top results for the given query.
    """
    try:
        response = tavily.search(query=query, max_results=5)
    except (requests.exceptions.RequestException, ConnectionResetError, OSError) as error:
        return f"Search temporarily unavailable: {error}"

    out = []
    for result in response.get("results", []):
        title = result.get("title", "No title")
        snippet = result.get("content", "No content")
        url = result.get("url", "No URL")
        out.append(f"Title: {title}\nSnippet: {snippet}\nURL: {url}\n")

    return "\n".join(out) if out else "No results found."



@tool
def web_scrape(url: str) -> str:
    """
    Scrape the content of a web page and return the text content.
    """
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    last_error = None
    for attempt in range(2):
        try:
            response = requests.get(url, timeout=(5, 15), headers=headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
                tag.decompose()
            return soup.get_text(separator="\n", strip=True)[:3000]
        except (requests.exceptions.RequestException, ConnectionResetError, OSError) as error:
            last_error = error
            if attempt == 0:
                time.sleep(0.5)

    return f"Unable to fetch this source right now: {last_error}"

