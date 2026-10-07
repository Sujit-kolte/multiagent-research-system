from langchain.agents import create_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import StrOutputParser
from tools import web_search, web_scrape
from langchain_mistralai import ChatMistralAI
import os
from dotenv import load_dotenv
load_dotenv()
model = ChatMistralAI(
    model="codestral-latest")

def build_search_agent():
     return create_agent(
        model=model,
        tools=[web_search],
      
    )
def build_scrape_agent():
    return create_agent(
        model=model,
        tools=[web_scrape],
       
    )
# writer chain
writer_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant that can write content based on the information provided."),
        ("human", """write detailed research report on below topic .
        topic: {topic}
        reacherch gathered: {research}
        struchture:
        -introduction
        -key findings(minimum 3 well explained points )
        -conclusion
        -sources

        be detailed ,factual and professional in your writing.
        """),
    ]
)
writer_chain=writer_prompt|model|StrOutputParser()

#critic chain
critic_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "you are sharp constructive search critic.be honest and sepecific"),
        ("human", """review the below research report and evaluate strictly.
        research report: {report}
        respond its this exact format:
        score:x/10
        areas of improvement: [list areas of improvement]
        one line verdict: [one line verdict]
        feedback: [brief feedback]
        be detailed ,factual and professional in your writing.
        """),
    ]
)
critic_chain=critic_prompt|model|StrOutputParser()
