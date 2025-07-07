# SAM.gov Search Testing Results

## Overview
We conducted systematic testing of SAM.gov's search functionality to understand what query formats work best for finding opportunities. The testing was done using the SAM.gov API with various search terms and combinations.

## Test Environment
- **Date Range**: January 1, 2024 - December 31, 2024 (expanded from 90 days to full year)
- **API Endpoint**: `/api/sam-search`
- **Sample Size**: 20 opportunities available in the date range
- **Search Parameter**: `q` (query parameter)
- **Default Range**: Current year (January 1st to current date)

## Key Findings

### ✅ Working Search Terms

#### Single Words (Case Insensitive)
- `SYSTEM` / `system` - Found 1 result
- `NAVAL` / `navy` - Found 1 result  
- `FLUENT` - Found 1 result
- `CONTROLLER` - Found 1 result
- `AIR` - Found 2 results
- `FORCE` - Found 1 result
- `BASE` - Found 1 result
- `CHROMIUM` - Found 1 result
- `REMOVAL` - Found 1 result
- `SERVOMECHANISM` - Found 1 result
- `HYDRAULIC` - Found 1 result
- `OPERATIONS` - Found 1 result
- `SUPPORT` - Found 1 result

#### Multi-Word Phrases (Space Separated)
- `AIR FORCE` - Found 2 results
- `FLUENT SYSTEM` - Found 1 result
- `MANAGEMENT SYSTEM` - Found 1 result
- `CHROMIUM REMOVAL` - Found 1 result
- `SERVOMECHANISM HYDRAULIC` - Found 1 result
- `OPERATIONS SUPPORT` - Found 1 result

### ❌ Non-Working Search Terms

#### Single Words
- `DEPARTMENT` - Returns 0 results (despite "Department of the Navy" opportunity existing)
- `REAL` - Returns 0 results (despite "Real Property Management" opportunity existing)
- `PROPERTY` - Returns 0 results
- `MANAGEMENT` - Returns 0 results
- `SOFTWARE` - Returns 0 results (correctly, no software opportunities)
- `WEBSITE` - Returns 0 results (correctly, no website opportunities)

#### Multi-Word Phrases
- `DEPARTMENT NAVY` - Returns 0 results
- `REAL PROPERTY` - Returns 0 results
- `PROPERTY MANAGEMENT` - Returns 0 results

### 🔍 Search Behavior Patterns

1. **Exact Word Matching**: SAM.gov appears to do exact word matching rather than stemming
   - `SYSTEM` works, but `SYSTEMS` (plural) doesn't
   - This suggests no automatic pluralization or stemming

2. **Case Insensitive**: Both uppercase and lowercase versions work
   - `SYSTEM` and `system` both return the same results

3. **Multi-Word Support**: Space-separated phrases work well
   - `AIR FORCE`, `FLUENT SYSTEM`, etc. all work correctly

4. **Inconsistent Coverage**: Some words in opportunities don't appear to be searchable
   - "Department", "Real", "Property" don't work despite being in opportunity titles
   - This suggests SAM.gov may not index all words or may have specific indexing rules

5. **Relevant Results**: When searches work, they return relevant results
   - `CHROMIUM REMOVAL` correctly finds "Hexavalent Chromium Removal"
   - `MANAGEMENT SYSTEM` correctly finds "Department of the Navy Real Property Management System"

## Recommendations for Search Implementation

### 1. **Expanded Date Range**
- **Current Implementation**: Default date range expanded to current year (January 1st to current date)
- **Benefits**: More opportunities available for search, better coverage of relevant contracts
- **SAM.gov Limitations**: Date ranges must be within reasonable bounds (roughly 1-2 years max)

### 2. **Client-Side Filtering is Essential**
Since SAM.gov's search is inconsistent and doesn't index all words, client-side filtering is necessary to provide reliable search results.

### 3. **Search Strategy**
- **Primary**: Use SAM.gov API with known working terms
- **Fallback**: Implement client-side text search on all opportunity fields
- **Enhancement**: Use semantic search for better relevance

### 4. **Query Optimization**
- Test common terms to identify which work with SAM.gov
- Use multi-word phrases when possible (e.g., "AIR FORCE" vs "AIR" + "FORCE")
- Implement fuzzy matching for client-side search

### 5. **User Experience**
- Provide search suggestions based on working terms
- Show both SAM.gov filtered results and client-side filtered results
- Allow users to see the difference between server-side and client-side filtering

## Sample Opportunities in Test Dataset

1. **Hexavalent Chromium Removal** (NAICS: 562910)
2. **Combined Request for Information and Synopsis** (NAICS: 333611)
3. **Servomechanism, Hydraulic** (NAICS: 336413)
4. **Tinker Air Force Base Operations Support Service** (NAICS: 561210)
5. **6515--Fluent System and RF Controller Model** (NAICS: 339112)
6. **Department of the Navy Real Property Management System** (NAICS: 541611)
7. **NAVAL POSTGRADUATE SCHOOL MODERNIZATION** (NAICS: 236220)

## Conclusion

SAM.gov's search functionality is **partially working** but **inconsistent**. While it can find some opportunities with specific terms, it fails to index many words that appear in opportunity titles. This makes client-side filtering essential for providing reliable search results to users.

The best approach is to:
1. Use SAM.gov search as a first pass with known working terms
2. Implement comprehensive client-side filtering as a fallback
3. Combine both approaches for optimal search coverage
4. Provide clear feedback to users about search limitations 