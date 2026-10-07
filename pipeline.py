from agent import build_search_agent, build_scrape_agent, writer_chain, critic_chain

def run_search_pipeline(topic: str)-> dict:
    state={}
    search_agent = build_search_agent()
    search_results = search_agent.invoke({"messages":[("user", f"Search for information about {topic}")]})
    state['search_results'] = search_results['messages'][-1].text
    print(f"Search Results:\n{state['search_results']}\n")
    # Now, scrape the top result from the search results
    print("/n"+"="*50)
    print("Scraping the top result from the search results...")
    reader_agent= build_scrape_agent()
    reader_agent_response = reader_agent.invoke({"messages":[("user", f"based on following search result about {topic} scrape the content of the top result:  pick more relevant URL and scrape deeper content\n{state['search_results']}")]})
    state['scraped_content'] = reader_agent_response['messages'][-1].text
    print(f"Scraped Content:\n{state['scraped_content']}\n")
    print("/n"+"="*50)

    #3 writer chain
    print("Generating research report...")
    research_report = writer_chain.invoke({"topic": topic, "research": state['scraped_content']})
    state['research_report'] = research_report
    print(f"Research Report:\n{state['research_report']}\n")
    print("/n"+"="*50)

    #4 critic chain
    print("Evaluating research report...")
    evaluation = critic_chain.invoke({"report": state['research_report']})
    state['evaluation'] = evaluation
    print(f"Evaluation:\n{state['evaluation']}\n")
    print("/n"+"="*50)
    return state

if __name__ == "__main__":
    topic = input("Enter the topic for research: ")
    
    run_search_pipeline(topic)