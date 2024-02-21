export interface AddressSuggestion {
    description: string;
    placeId: string;
    types: string[];
    structuredFormatting: {
      main_text: string;
      main_text_matched_substrings: Array<{
        length: number;
        offset: number;
      }>;
      secondary_text: string;
    };
  }
  