# NAICS-Based Search Guide

## Overview

OpenSAM has been reoriented to focus on NAICS codes and opportunity types for more reliable and consistent search results. This approach addresses the limitations of SAM.gov's text-based search functionality.

## Why NAICS-Based Search?

### Problems with Text Search
- SAM.gov's text search (`q` parameter) is unreliable and inconsistent
- Some search terms return results while others don't, even when terms appear in opportunity titles
- Results are often alphabetical rather than relevant
- Limited filtering capabilities

### Benefits of NAICS-Based Search
- **Reliable**: NAICS codes are standardized and consistently applied
- **Precise**: Target specific industries and service categories
- **Comprehensive**: Covers all major business sectors
- **Consistent**: Results are predictable and relevant

## NAICS Code Categories

### Information Technology & Software
- **541511**: Custom Computer Programming Services
- **541512**: Computer Systems Design Services
- **541519**: Other Computer Related Services
- **518210**: Data Processing, Hosting, and Related Services

### Cybersecurity & Information Security
- **541511**: Custom Computer Programming Services
- **541512**: Computer Systems Design Services
- **541519**: Other Computer Related Services
- **561621**: Security Systems Services

### Healthcare & Medical
- **621111**: Offices of Physicians
- **621210**: Offices of Dentists
- **621511**: Medical Laboratories
- **621512**: Diagnostic Imaging Centers

### Construction & Infrastructure
- **236220**: Commercial and Institutional Building Construction
- **237310**: Highway, Street, and Bridge Construction
- **238110**: Poured Concrete Foundation and Structure Contractors
- **238210**: Electrical Contractors

### Manufacturing & Engineering
- **332997**: Industrial Valve Manufacturing
- **333611**: Turbine and Turbine Generator Set Units Manufacturing
- **333612**: Speed Changer, Industrial High-Speed Drive, and Gear Manufacturing
- **333613**: Mechanical Power Transmission Equipment Manufacturing

### Professional Services
- **541611**: Administrative Management and General Management Consulting Services
- **541612**: Human Resources Consulting Services
- **541613**: Marketing Consulting Services
- **541614**: Process, Physical Distribution, and Logistics Consulting Services

## Opportunity Types

### Solicitation Types
- **Solicitation**: General solicitation notices
- **Request for Proposal (RFP)**: Formal request for proposals
- **Request for Quote (RFQ)**: Request for quotes
- **Request for Information (RFI)**: Information gathering
- **Invitation for Bid (IFB)**: Formal bid invitations
- **Sources Sought**: Market research
- **Combined Synopsis/Solicitation**: Combined notices

### Set-Aside Opportunities
- **Small Business Set-Aside**: Reserved for small businesses
- **8(a) Business Development Program**: For 8(a) certified businesses
- **Service-Disabled Veteran-Owned Small Business**: For veteran-owned businesses
- **Women-Owned Small Business**: For women-owned businesses
- **HUBZone Small Business**: For HUBZone businesses

### Specialized Opportunities
- **Research and Development**: R&D contracts
- **Innovation**: Innovative technology projects
- **Pilot Program**: Experimental programs
- **Demonstration Project**: Technology demonstrations

## How to Use

### 1. Preset Queries
Click on any preset query to automatically search with relevant NAICS codes and opportunity types:

- **IT & Software Development**: Searches for software development contracts
- **Cybersecurity**: Focuses on information security opportunities
- **Healthcare & Medical**: Medical and healthcare service contracts
- **Construction & Infrastructure**: Building and infrastructure projects
- **Manufacturing & Engineering**: Manufacturing and engineering contracts
- **Professional Services**: Consulting and professional services
- **Small Business Set-Asides**: Small business opportunities
- **Research & Development**: R&D and innovation contracts

### 2. Manual Search
You can also manually specify NAICS codes and opportunity types:

1. Click "Filters" to open the filter panel
2. Enter NAICS codes (comma-separated for multiple codes)
3. Select opportunity types
4. Click "Search"

### 3. Advanced Filtering
- **Date Range**: Default is current year (January 1st to current date)
- **State**: Filter by specific states
- **Agency**: Filter by government agencies
- **Set-Aside**: Filter by set-aside categories

## Search Results

### Enhanced Results
- **Relevance**: Results are filtered by NAICS codes and opportunity types
- **Comprehensive**: Covers the entire current year by default
- **Cached**: Results are cached for 30 minutes for faster subsequent searches
- **Vector Store**: Opportunities are stored in vector database for semantic matching

### Company Matching
- **AI-Powered**: Uses company profiles to calculate match scores
- **Capability-Based**: Matches company capabilities to opportunity requirements
- **NAICS Alignment**: Considers NAICS code alignment between company and opportunity

## Technical Implementation

### API Changes
- **Multiple NAICS Codes**: Support for comma-separated NAICS codes
- **Multiple Opportunity Types**: Support for multiple opportunity types
- **Enhanced Filtering**: Better parameter handling and validation
- **Caching**: Improved caching with Redis for better performance

### Frontend Updates
- **Preset Queries**: Updated to use NAICS codes instead of text search
- **Filter Panel**: Enhanced with NAICS code and opportunity type selection
- **Search Suggestions**: Improved suggestions based on industry categories
- **Results Display**: Better organization and relevance scoring

## Best Practices

### For Users
1. **Start with Presets**: Use preset queries for common searches
2. **Combine Filters**: Use multiple NAICS codes for broader searches
3. **Check Set-Asides**: Look for set-aside opportunities if eligible
4. **Monitor Regularly**: Set up alerts for new opportunities in your NAICS codes

### For Developers
1. **Cache Results**: Leverage the built-in caching for better performance
2. **Use Vector Store**: Enable semantic search for better matching
3. **Monitor API Limits**: Respect SAM.gov rate limits
4. **Update NAICS Codes**: Keep NAICS code mappings current

## Troubleshooting

### Common Issues
1. **No Results**: Try broader NAICS codes or different opportunity types
2. **Slow Search**: Results are cached, subsequent searches will be faster
3. **API Errors**: Check SAM.gov API key configuration
4. **Date Range**: SAM.gov has date range limitations (1-2 years max)

### Support
For technical support or questions about NAICS codes:
- Check the [NAICS Association website](https://www.naics.com/)
- Review [SAM.gov documentation](https://sam.gov/content/home)
- Contact via LinkedIn: [Akshay Akula](https://www.linkedin.com/in/akshayakula/)

## Future Enhancements

### Planned Features
- **NAICS Code Browser**: Interactive NAICS code selection tool
- **Industry Trends**: Analytics on opportunity trends by NAICS code
- **Automated Matching**: AI-powered opportunity matching based on company profiles
- **Alert System**: Email notifications for new opportunities in selected NAICS codes
- **Market Analysis**: Competitive analysis and market intelligence

### Integration Opportunities
- **Contract Vehicle Matching**: Match opportunities to contract vehicles
- **Geographic Filtering**: Advanced location-based filtering
- **Value Range Filtering**: Filter by contract value ranges
- **Response Deadline Tracking**: Track and manage response deadlines 