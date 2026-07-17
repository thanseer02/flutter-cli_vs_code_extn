const pattern = /Failed to apply plugin \[id '(.+)'\]/i;
const chunk = "Failed to apply plugin [id 'com.android.internal.version-check']";

console.log("Regex matches?", pattern.test(chunk));
const lowerChunk = chunk.toLowerCase();
console.log("Includes failed?", lowerChunk.includes('failed'));
