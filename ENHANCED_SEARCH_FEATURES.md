# Enhanced Search Features

## Overview

The OpenSAM AI Dashboard now includes enhanced search functionality with title-based search, NAICS code-based query, and pagination support. These features provide more precise and efficient searching of SAM.gov opportunities.

## New Features

### 1. Title-Based Search

**What it is:** A dedicated search field for searching opportunities by title or keywords.

**How to use:**
- Enter keywords in the main search field (e.g., "software development", "AI services")
- The search will look for matches in opportunity titles, descriptions, and synopses
- Supports natural language queries

**Example queries:**
- "software development"
- "artificial intelligence"
- "cybersecurity services"
- "cloud computing"

### 2. NAICS Code-Based Query

**What it is:** A dedicated field for searching by NAICS (North American Industry Classification System) codes.

**How to use:**
- Enter NAICS codes in the dedicated field (e.g., "541511, 541512, 541519")
- Multiple codes can be separated by commas
- The search will find opportunities matching any of the specified NAICS codes

**Common NAICS Codes:**
- `541511` - Custom Computer Programming Services
- `541512` - Computer Systems Design Services
- `541519` - Other Computer Related Services
- `621111` - Offices of Physicians (except Mental Health Specialists)
- `236220` - Commercial Building Construction

### 3. Pagination

**What it is:** Support for browsing through large result sets with page-by-page navigation.

**Features:**
- Configurable results per page (default: 20)
- Page navigation with Previous/Next buttons
- Page number buttons for direct navigation
- Results counter showing current range and total
- Automatic page reset when search criteria change

**How to use:**
- Search results are automatically paginated
- Use the pagination controls at the bottom of results
- Change pages to view more opportunities

### 4. Advanced Filters

**What it is:** Comprehensive filtering options for precise opportunity matching.

**Available filters:**
- **Date Range:** Start and end dates for opportunity posting
- **State:** Filter by state (e.g., VA, DC, MD)
- **Agency:** Filter by government agency
- **Opportunity Type:** Solicitation, RFP, IFB, RFQ, etc.
- **Set-Aside:** Small business, 8(a), HUBZone, etc.
- **Estimated Value:** Min/max value ranges
- **Attachments:** Filter for opportunities with attachments

### 5. Preset Queries

**What it is:** Pre-configured search queries for common industry categories.

**Available presets:**
- IT & Software Development
- Cybersecurity & Information Security
- Healthcare & Medical
- Construction & Infrastructure
- Manufacturing & Engineering
- Professional Services
- Small Business Set-Asides
- Research & Development

**How to use:**
- Click "Preset Queries" button
- Select a category to automatically populate search criteria
- Click the preset card to execute the search

## Technical Implementation

### API Changes

The SAM search API (`/api/sam-search`) has been enhanced to support:

1. **Pagination parameters:**
   - `limit`: Number of results per page
   - `offset`: Starting position for pagination

2. **Enhanced filtering:**
   - Title search via `q` parameter
   - Multiple NAICS codes via `naicsCode` parameter
   - Additional filter parameters for precise matching

3. **Response format:**
   - `totalRecords`: Total number of matching opportunities
   - `opportunities`: Array of opportunity objects
   - `limit` and `offset`: Current pagination state

### Frontend Changes

The SearchView component has been updated with:

1. **Separate search fields:**
   - Title search input
   - NAICS code input with hash icon

2. **Pagination component:**
   - Page navigation controls
   - Results counter
   - Responsive design

3. **Advanced filters panel:**
   - Collapsible filter section
   - Form controls for all filter types
   - Clear filters functionality

4. **Enhanced state management:**
   - Pagination state
   - Filter state
   - Search history

## Usage Examples

### Basic Title Search
```
Title: "software development"
Result: Finds opportunities with "software development" in title/description
```

### NAICS Code Search
```
NAICS: "541511, 541512"
Result: Finds opportunities in computer programming and systems design
```

### Combined Search
```
Title: "AI services"
NAICS: "541511"
Type: "Request for Proposal (RFP)"
Result: AI-related RFPs in computer programming services
```

### Advanced Filtering
```
Title: "cybersecurity"
NAICS: "541511, 541512"
State: "VA"
Agency: "Department of Defense"
Min Value: 100000
Max Value: 1000000
Result: Cybersecurity opportunities in Virginia for DoD with specified value range
```

## Performance Considerations

1. **Caching:** Search results are cached for 30 minutes to improve performance
2. **Pagination:** Large result sets are paginated to reduce load times
3. **Rate Limiting:** API calls are rate-limited to respect SAM.gov limits
4. **Optimized Queries:** Search parameters are optimized for SAM.gov API efficiency

## Future Enhancements

1. **Saved Searches:** Allow users to save and reuse search configurations
2. **Search Analytics:** Track popular searches and user behavior
3. **Advanced Sorting:** Sort by relevance, date, value, etc.
4. **Export Functionality:** Export search results to various formats
5. **Real-time Updates:** Notifications for new matching opportunities

## Troubleshooting

### Common Issues

1. **No results found:**
   - Check NAICS codes are valid
   - Verify date range is reasonable
   - Try broader search terms

2. **Slow search performance:**
   - Reduce number of NAICS codes
   - Narrow date range
   - Use more specific search terms

3. **API errors:**
   - Verify SAM.gov API key is configured
   - Check rate limits
   - Ensure network connectivity

### Debug Mode

Enable debug logging by adding `?debug=true` to the search URL to see detailed API requests and responses.

## Configuration

### Environment Variables

```bash
# Required
NEXT_PUBLIC_SAM_API_KEY=your_sam_gov_api_key

# Optional
SAM_BASE_URL=https://api.sam.gov
```

### Default Settings

- Results per page: 20
- Cache duration: 30 minutes
- Rate limit: 100 requests per minute
- Default date range: Current year

## Support

For issues or questions about the enhanced search features:

- Check the browser console for error messages
- Review the API logs for detailed error information
- Consult the SAM.gov API documentation for parameter details
- Contact support via LinkedIn: https://www.linkedin.com/in/akshayakula/ 