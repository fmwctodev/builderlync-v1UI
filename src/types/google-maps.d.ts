declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => { formatted_address?: string };
          };
        };
      };
    };
  }
}

export {};