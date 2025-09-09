export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, customKnowledge } = req.body;

// Check custom knowledge first if provided
if (customKnowledge) {
  for (const [id, item] of Object.entries(customKnowledge)) {
    const matchFound = item.keywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    if (matchFound) {
      return res.status(200).json({
        response: `💡 ${item.content}`
      });
    }
  }
}
    const knowledgeBase = {
      experience: {
        freshworks: "At Freshworks (2020-2022): Managed $4M+ ARR portfolio of 100+ MM & enterprise accounts across MEA & NAMER. Achieved 25% YoY expansion, 130%+ quota attainment, 2x Presidents Club. Built Field Service Management module by translating customer feedback into product features, resulting in $540K cross-sells. Expanded Thirty Madison from $10K to $132K ACV in 5 months by displacing ServiceNow and Monday.com.",
        vosyn: "At Vosyn AI (2024-Present): Driving product-market fit for conversational AI platform. Improved trial-to-paid conversion by 30%. Designed automated adoption frameworks. Achieved 92% CSAT during beta phase.",
        achievements: "Key achievements: 115% average NRR, $4M+ ARR managed, 2x President's Club winner, 130%+ consistent quota attainment. Pioneered displacement strategies against ServiceNow."
      },
      education: "MS Business Analytics at Babson College (2023-2024), GPA 3.4/4.0. Capstone: Led team building agentic RAG for PE consulting firm, automating 60% of manual processes.",
      projects: {
        churn: "SaaS Revenue & Churn Forecasting: Simulated 200K CRM records, created pipeline tables using Python, Power BI, Excel. Built cohort tracking and churn heatmaps.",
        ai: "Built this RAG-enabled portfolio chatbot with Anthropic integration, conversation memory, and voice capabilities. Previously created agentic RAG system for PE firm."
      },
      skills: "Technical: Python, SQL, Power BI, JavaScript. CRM: Salesforce, HubSpot, Gainsight, Freshdesk. Built RAG frameworks, predictive models, automated workflows."
    };

    function getRelevantContext(query) {
      const q = query.toLowerCase();
      let relevantChunks = [];

      if (q.includes('freshwork') || q.includes('president') || q.includes('club')) {
        relevantChunks.push(knowledgeBase.experience.freshworks);
      }
      if (q.includes('vosyn') || q.includes('current') || q.includes('now')) {
        relevantChunks.push(knowledgeBase.experience.vosyn);
      }
      if (q.includes('education') || q.includes('babson') || q.includes('degree')) {
        relevantChunks.push(knowledgeBase.education);
      }
      if (q.includes('project') || q.includes('churn') || q.includes('ai') || q.includes('system')) {
        relevantChunks.push(knowledgeBase.projects.churn);
        relevantChunks.push(knowledgeBase.projects.ai);
      }
      if (q.includes('skill') || q.includes('tool') || q.includes('tech')) {
        relevantChunks.push(knowledgeBase.skills);
      }
      if (q.includes('win') || q.includes('achieve') || q.includes('success')) {
        relevantChunks.push(knowledgeBase.experience.achievements);
      }

      if (relevantChunks.length === 0) {
        relevantChunks.push(knowledgeBase.experience.achievements);
        relevantChunks.push(knowledgeBase.education);
      }

      return relevantChunks.join('\n\n');
    }

    const relevantContext = getRelevantContext(message);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 250,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: `You are Parth Badani's personal AI assistant on his portfolio website.

Relevant information about Parth:
${relevantContext}

Question: ${message}

Instructions:
- Answer conversationally and specifically about Parth
- Use specific numbers and achievements from the context
- Be personable but professional
- Keep responses concise (2-3 sentences max)`
        }]
      })
    });

    const data = await response.json();

    return res.status(200).json({
      response: data.content[0].text
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      response: "I'm having trouble connecting. Please try again or email Parth directly at parthbadani96@gmail.com"
    });
  }
}