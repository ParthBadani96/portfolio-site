exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body);
    
    // Your knowledge base
    const parthContext = `
    Parth Badani: 4+ years Customer Success, 115% NRR, $4M+ ARR managed, 2x President's Club.
    
    Freshworks (2020-2022): Managed 100+ enterprise accounts. Expanded Thirty Madison from $10K to $132K in 5 months by displacing ServiceNow and Monday.com. Built Field Service Management module driving $540K cross-sells. Saved Salinas Valley Medical Centre from churn, grew from $40K to $125K.
    
    Current: Customer Success Intern at Vosyn AI - 30% trial-to-paid improvement, 92% CSAT.
    Education: MS Business Analytics, Babson College (3.4 GPA).
    Projects: Churn forecasting, Lead scoring, CRM pipeline analysis.
    Personal: Soccer, boxing, dancing, hiking, craft beer enthusiast.
    `;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `You are Parth's portfolio AI assistant. Using this context: ${parthContext}
          
          User asks: ${message}
          
          Provide a specific, detailed answer. If asked about Thirty Madison, explain the full expansion story. Be conversational and specific.`
        }]
      })
    });

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        response: data.content[0].text 
      })
    };
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        response: 'I apologize, I\'m having connection issues. Please try again or email Parth directly at parthbadani96@gmail.com'
      })
    };
  }
};