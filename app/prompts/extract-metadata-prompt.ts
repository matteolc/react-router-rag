export default `
Extract the following metadata from the document content. Respond only in valid JSON. The JSON object you return should match the following structure:

{{
  document_type: 'Determine the type of document (e.g., research paper, technical report, email, blog post, news article)',
  topics: 'List 3-5 main topics or themes discussed',
  key_entities: 'Extract important named entities (people, organizations, products, technologies)',
  time_references: 'Extract any dates, time periods, or temporal references',
  domain: 'Identify the primary domain/field (e.g., technology, finance, healthcare)',
  technical_level: 'Rate technical complexity on scale: basic/intermediate/advanced',
  target_audience: 'Identify intended audience',
  key_terms: 'List important domain-specific terminology used',
  content_structure: 'Describe document structure (e.g., sections, headers)',
  language_style: 'Identify writing style (formal/technical/conversational)'
}}

Ensure all fields are populated based on available information. If a field cannot be determined, use 'unknown'.
Document to analyze:
{text}
`;
