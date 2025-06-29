import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai';

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  try {
    // Check if API key is configured
    if (!configuration.apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { action, content } = body;

    if (!action || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let prompt = '';
    let response;

    switch (action) {
      case 'mapColumns':
        prompt = `I have a CSV file with the following columns: ${content.columns.join(', ')}. 
        The expected columns are: ${content.expectedColumns.join(', ')}. 
        Please map the existing columns to the expected columns format. Return the mapping as a JSON object.`;
        break;
      case 'naturalLanguageSearch':
        prompt = `I have data about clients, workers, and tasks with the following structure:
        Clients: ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag, AttributesJSON
        Workers: WorkerID, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel
        Tasks: TaskID, Duration, RequiredSkills, PreferredPhases, MaxConcurrent
        
        Translate this natural language query into a search filter: "${content.query}"
        Return the result as a JSON object with entity type and filter criteria.`;
        break;
      case 'createRule':
        prompt = `Convert this natural language rule description into a formal rule object:
        "${content.description}"
        
        The rule should have these properties:
        - type: one of [coRun, slotRestriction, loadLimit, phaseWindow, patternMatch, priorityOverride]
        - description: a clear description of the rule
        - parameters: an object with the specific parameters for this rule type
        - priority: a number from 1-10 indicating importance
        
        Return the result as a JSON object.`;
        break;
      case 'suggestFix':
        prompt = `I have a validation error in my data:
        Entity Type: ${content.entityType}
        Field: ${content.field}
        Error Type: ${content.errorType}
        Message: ${content.message}
        
        Please suggest a fix for this error. Return the suggestion as a string.`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Call OpenAI API
    response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 500,
      temperature: 0.6,
    });

    const result = response.data.choices[0].text?.trim();

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Error with OpenAI API:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during the AI request' },
      { status: 500 }
    );
  }
}