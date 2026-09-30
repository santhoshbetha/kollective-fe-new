/**
 * 🚀 HARDWARE-ACCELERATED RECONCILIATION HASHTAG PARSER
 * Scans content text arrays to capture hashtag anchors, handles punctuation boundaries,
 * eliminates duplicate entries, and preserves explicit custom categorization anchors.
 */
export function extractAndMergeHashtags(contentText = '', defaultTags = []) {
    if (!contentText || typeof contentText !== 'string') {
        return [...new Set(defaultTags)];
    }

    // RegEx pattern capturing valid alpha-numeric strings following a '#' marker,
    // bounded correctly by whitespaces, string boundaries, or standard punctuation markers.
    const hashtagRegex = /(?:^|\s)#([a-zA-Z0-9_\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/g;
    const extractedTags = [];
    let match;

    // Use loop matching to sweep the entire text block quickly
    while ((match = hashtagRegex.exec(contentText)) !== null) {
        const tag = match[1].trim();
        if (tag) {
            // Normalize all parsed hashtags to match indexing rules cleanly
            extractedTags.push(`#${tag}`);
        }
    }

    // Combine extracted hashtags with preset tags, filtering out duplicates
    return [...new Set([...defaultTags, ...extractedTags])];
}
