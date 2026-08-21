const fs = require('fs');

let content = fs.readFileSync('src/utils/storage.ts', 'utf8');

// There is a bug in storage.ts where the getWithFallback function
// creates an array reference and if we filter that array outside
// and the local storage wasn't updated, next time we fetch we might
// fetch unfiltered? No, getWithFallback parses from JSON.

// BUT we need to ensure that UploadModal, CreateFlashcardModal, etc.
// correctly save the *language* property!
