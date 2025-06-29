import axios from 'axios';

/**
 * Interface for AI API request parameters
 */
interface AIRequestParams {
  action: 'mapColumns' | 'naturalLanguageSearch' | 'createRule' | 'suggestFix';
  content: any;
}

/**
 * Makes a request to the AI API endpoint
 * @param params Request parameters
 * @returns Promise with the AI response
 */
export const callAIService = async (params: AIRequestParams) => {
  try {
    const response = await axios.post('/api/ai', params);
    return response.data.result;
  } catch (error: any) {
    console.error('AI service error:', error);
    throw new Error(error.response?.data?.error || 'Failed to process AI request');
  }
};

/**
 * Maps columns from a CSV/Excel file to expected columns using AI
 * @param columns The columns found in the file
 * @param expectedColumns The expected column names
 * @returns Promise with the mapping result
 */
export const mapColumnsWithAI = async (columns: string[], expectedColumns: string[]) => {
  try {
    const result = await callAIService({
      action: 'mapColumns',
      content: { columns, expectedColumns },
    });
    
    // Parse the result which should be a JSON string
    let mapping;
    try {
      mapping = JSON.parse(result);
    } catch (e) {
      // If the result isn't valid JSON, try to extract JSON from the text
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mapping = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response');
      }
    }
    
    return mapping;
  } catch (error) {
    console.error('Error mapping columns with AI:', error);
    return null;
  }
};

/**
 * Processes a natural language search query using AI
 * @param query The natural language query
 * @returns Promise with the search filter
 */
export const processNaturalLanguageSearch = async (query: string) => {
  try {
    const result = await callAIService({
      action: 'naturalLanguageSearch',
      content: { query },
    });
    
    // Parse the result
    let searchFilter;
    try {
      searchFilter = JSON.parse(result);
    } catch (e) {
      // If the result isn't valid JSON, try to extract JSON from the text
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        searchFilter = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response');
      }
    }
    
    return searchFilter;
  } catch (error) {
    console.error('Error processing natural language search:', error);
    return null;
  }
};

/**
 * Creates a rule from a natural language description using AI
 * @param description The natural language rule description
 * @returns Promise with the rule object
 */
export const createRuleFromDescription = async (description: string) => {
  try {
    const result = await callAIService({
      action: 'createRule',
      content: { description },
    });
    
    // Parse the result
    let rule;
    try {
      rule = JSON.parse(result);
    } catch (e) {
      // If the result isn't valid JSON, try to extract JSON from the text
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        rule = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response');
      }
    }
    
    return rule;
  } catch (error) {
    console.error('Error creating rule from description:', error);
    return null;
  }
};

/**
 * Gets AI suggestions for fixing validation errors
 * @param entityType The type of entity (client, worker, task)
 * @param field The field with the error
 * @param errorType The type of error
 * @param message The error message
 * @returns Promise with the suggestion
 */
export const getSuggestionForError = async (
  entityType: string,
  field: string,
  errorType: string,
  message: string
) => {
  try {
    const result = await callAIService({
      action: 'suggestFix',
      content: { entityType, field, errorType, message },
    });
    
    return result;
  } catch (error) {
    console.error('Error getting suggestion for error:', error);
    return null;
  }
};