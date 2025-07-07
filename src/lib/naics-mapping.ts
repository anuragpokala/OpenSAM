/**
 * NAICS Code and Opportunity Type Mappings
 * Comprehensive mapping for SAM.gov search filtering
 */

// Common NAICS Codes by Industry
export const NAICS_CODES = {
  // Information Technology & Software
  IT_SOFTWARE: {
    name: 'Information Technology & Software',
    codes: [
      { code: '541511', description: 'Custom Computer Programming Services' },
      { code: '541512', description: 'Computer Systems Design Services' },
      { code: '541519', description: 'Other Computer Related Services' },
      { code: '541511', description: 'Custom Computer Programming Services' },
      { code: '541512', description: 'Computer Systems Design Services' },
      { code: '541519', description: 'Other Computer Related Services' },
      { code: '518210', description: 'Data Processing, Hosting, and Related Services' },
      { code: '541330', description: 'Engineering Services' },
      { code: '541350', description: 'Building Inspection Services' },
      { code: '541360', description: 'Geophysical Surveying and Mapping Services' },
      { code: '541370', description: 'Surveying and Mapping (except Geophysical) Services' },
      { code: '541380', description: 'Testing Laboratories' },
      { code: '541410', description: 'Interior Design Services' },
      { code: '541420', description: 'Industrial Design Services' },
      { code: '541430', description: 'Graphic Design Services' },
      { code: '541490', description: 'Other Specialized Design Services' },
      { code: '541511', description: 'Custom Computer Programming Services' },
      { code: '541512', description: 'Computer Systems Design Services' },
      { code: '541519', description: 'Other Computer Related Services' },
      { code: '541611', description: 'Administrative Management and General Management Consulting Services' },
      { code: '541612', description: 'Human Resources Consulting Services' },
      { code: '541613', description: 'Marketing Consulting Services' },
      { code: '541614', description: 'Process, Physical Distribution, and Logistics Consulting Services' },
      { code: '541618', description: 'Other Management Consulting Services' },
      { code: '541620', description: 'Environmental Consulting Services' },
      { code: '541690', description: 'Other Scientific and Technical Consulting Services' },
      { code: '541715', description: 'Research and Development in the Physical, Engineering, and Life Sciences' },
      { code: '541720', description: 'Research and Development in the Social Sciences and Humanities' },
      { code: '541810', description: 'Advertising Agencies' },
      { code: '541820', description: 'Public Relations Agencies' },
      { code: '541830', description: 'Media Buying Agencies' },
      { code: '541840', description: 'Media Representatives' },
      { code: '541850', description: 'Outdoor Advertising' },
      { code: '541860', description: 'Direct Mail Advertising' },
      { code: '541870', description: 'Advertising Material Distribution Services' },
      { code: '541890', description: 'Other Services Related to Advertising' },
      { code: '541910', description: 'Marketing Research and Public Opinion Polling' },
      { code: '541920', description: 'Photography Studios, Portrait' },
      { code: '541930', description: 'Translation and Interpretation Services' },
      { code: '541940', description: 'Veterinary Services' },
      { code: '541990', description: 'All Other Professional, Scientific, and Technical Services' }
    ]
  },

  // Cybersecurity & Information Security
  CYBERSECURITY: {
    name: 'Cybersecurity & Information Security',
    codes: [
      { code: '541511', description: 'Custom Computer Programming Services' },
      { code: '541512', description: 'Computer Systems Design Services' },
      { code: '541519', description: 'Other Computer Related Services' },
      { code: '541690', description: 'Other Scientific and Technical Consulting Services' },
      { code: '541715', description: 'Research and Development in the Physical, Engineering, and Life Sciences' },
      { code: '561612', description: 'Security Guards and Patrol Services' },
      { code: '561621', description: 'Security Systems Services (except Locksmiths)' },
      { code: '561622', description: 'Locksmiths' }
    ]
  },

  // Healthcare & Medical
  HEALTHCARE: {
    name: 'Healthcare & Medical',
    codes: [
      { code: '621111', description: 'Offices of Physicians (except Mental Health Specialists)' },
      { code: '621112', description: 'Offices of Physicians, Mental Health Specialists' },
      { code: '621210', description: 'Offices of Dentists' },
      { code: '621310', description: 'Offices of Chiropractors' },
      { code: '621320', description: 'Offices of Optometrists' },
      { code: '621330', description: 'Offices of Mental Health Practitioners (except Physicians)' },
      { code: '621340', description: 'Offices of Physical, Occupational and Speech Therapists, and Audiologists' },
      { code: '621391', description: 'Offices of Podiatrists' },
      { code: '621399', description: 'Offices of All Other Miscellaneous Health Practitioners' },
      { code: '621410', description: 'Family Planning Centers' },
      { code: '621420', description: 'Outpatient Mental Health and Substance Abuse Centers' },
      { code: '621491', description: 'HMO Medical Centers' },
      { code: '621492', description: 'Kidney Dialysis Centers' },
      { code: '621493', description: 'Freestanding Ambulatory Surgical and Emergency Centers' },
      { code: '621498', description: 'All Other Outpatient Care Centers' },
      { code: '621511', description: 'Medical Laboratories' },
      { code: '621512', description: 'Diagnostic Imaging Centers' },
      { code: '621610', description: 'Home Health Care Services' },
      { code: '621910', description: 'Ambulance Services' },
      { code: '621991', description: 'Blood and Organ Banks' },
      { code: '621999', description: 'All Other Miscellaneous Ambulatory Health Care Services' },
      { code: '622110', description: 'General Medical and Surgical Hospitals' },
      { code: '622210', description: 'Psychiatric and Substance Abuse Hospitals' },
      { code: '622310', description: 'Specialty (except Psychiatric and Substance Abuse) Hospitals' },
      { code: '623110', description: 'Nursing Care Facilities (Skilled Nursing Facilities)' },
      { code: '623210', description: 'Residential Intellectual and Developmental Disability Facilities' },
      { code: '623220', description: 'Residential Mental Health and Substance Abuse Facilities' },
      { code: '623311', description: 'Continuing Care Retirement Communities' },
      { code: '623312', description: 'Assisted Living Facilities for the Elderly' },
      { code: '623990', description: 'Other Residential Care Facilities' },
      { code: '624110', description: 'Child and Youth Services' },
      { code: '624120', description: 'Services for the Elderly and Persons with Disabilities' },
      { code: '624190', description: 'Other Individual and Family Services' },
      { code: '624210', description: 'Community Food Services' },
      { code: '624221', description: 'Temporary Shelters' },
      { code: '624229', description: 'Other Community Housing Services' },
      { code: '624230', description: 'Emergency and Other Relief Services' },
      { code: '624310', description: 'Vocational Rehabilitation Services' },
      { code: '624410', description: 'Child Day Care Services' }
    ]
  },

  // Construction & Infrastructure
  CONSTRUCTION: {
    name: 'Construction & Infrastructure',
    codes: [
      { code: '236115', description: 'New Single-Family Housing Construction (except For-Sale Builders)' },
      { code: '236116', description: 'New Multifamily Housing Construction (except For-Sale Builders)' },
      { code: '236117', description: 'New Housing For-Sale Builders' },
      { code: '236118', description: 'Residential Remodelers' },
      { code: '236210', description: 'Industrial Building Construction' },
      { code: '236220', description: 'Commercial and Institutional Building Construction' },
      { code: '237110', description: 'Water and Sewer Line and Related Structures Construction' },
      { code: '237120', description: 'Oil and Gas Pipeline and Related Structures Construction' },
      { code: '237130', description: 'Power and Communication Line and Related Structures Construction' },
      { code: '237210', description: 'Land Subdivision' },
      { code: '237310', description: 'Highway, Street, and Bridge Construction' },
      { code: '237990', description: 'Other Heavy and Civil Engineering Construction' },
      { code: '238110', description: 'Poured Concrete Foundation and Structure Contractors' },
      { code: '238120', description: 'Structural Steel and Precast Concrete Contractors' },
      { code: '238130', description: 'Framing Contractors' },
      { code: '238140', description: 'Masonry Contractors' },
      { code: '238150', description: 'Glass and Glazing Contractors' },
      { code: '238160', description: 'Roofing Contractors' },
      { code: '238170', description: 'Siding Contractors' },
      { code: '238190', description: 'Other Foundation, Structure, and Building Exterior Contractors' },
      { code: '238210', description: 'Electrical Contractors and Other Wiring Installation Contractors' },
      { code: '238220', description: 'Plumbing, Heating, and Air-Conditioning Contractors' },
      { code: '238290', description: 'Other Building Equipment Contractors' },
      { code: '238310', description: 'Drywall and Insulation Contractors' },
      { code: '238320', description: 'Painting and Wall Covering Contractors' },
      { code: '238330', description: 'Flooring Contractors' },
      { code: '238340', description: 'Tile and Terrazzo Contractors' },
      { code: '238350', description: 'Finish Carpentry Contractors' },
      { code: '238390', description: 'Other Building Finishing Contractors' },
      { code: '238910', description: 'Site Preparation Contractors' },
      { code: '238990', description: 'All Other Specialty Trade Contractors' }
    ]
  },

  // Manufacturing
  MANUFACTURING: {
    name: 'Manufacturing',
    codes: [
      { code: '332996', description: 'Fabricated Pipe and Pipe Fitting Manufacturing' },
      { code: '332997', description: 'Industrial Valve Manufacturing' },
      { code: '332998', description: 'Fabricated Pipe and Pipe Fitting Manufacturing' },
      { code: '332999', description: 'Miscellaneous Fabricated Metal Product Manufacturing' },
      { code: '333111', description: 'Farm Machinery and Equipment Manufacturing' },
      { code: '333112', description: 'Lawn and Garden Tractor and Home Lawn and Garden Equipment Manufacturing' },
      { code: '333120', description: 'Construction Machinery Manufacturing' },
      { code: '333131', description: 'Mining Machinery and Equipment Manufacturing' },
      { code: '333132', description: 'Oil and Gas Field Machinery and Equipment Manufacturing' },
      { code: '333241', description: 'Semiconductor Machinery Manufacturing' },
      { code: '333242', description: 'Semiconductor and Related Device Manufacturing' },
      { code: '333243', description: 'Semiconductor and Related Device Manufacturing' },
      { code: '333244', description: 'Printing Machinery and Equipment Manufacturing' },
      { code: '333249', description: 'Other Industrial Machinery Manufacturing' },
      { code: '333314', description: 'Optical Instrument and Lens Manufacturing' },
      { code: '333315', description: 'Photographic and Photocopying Equipment Manufacturing' },
      { code: '333316', description: 'Photographic and Photocopying Equipment Manufacturing' },
      { code: '333318', description: 'Other Commercial and Service Industry Machinery Manufacturing' },
      { code: '333413', description: 'Industrial and Commercial Fan and Blower and Air Purification Equipment Manufacturing' },
      { code: '333414', description: 'Heating Equipment (except Warm Air Furnaces) Manufacturing' },
      { code: '333415', description: 'Air-Conditioning and Warm Air Heating Equipment and Commercial and Industrial Refrigeration Equipment Manufacturing' },
      { code: '333511', description: 'Industrial Mold Manufacturing' },
      { code: '333514', description: 'Special Die and Tool, Die Set, Jig, and Fixture Manufacturing' },
      { code: '333515', description: 'Cutting Tool and Machine Tool Accessory Manufacturing' },
      { code: '333517', description: 'Machine Tool Manufacturing' },
      { code: '333519', description: 'Rolling Mill and Other Metalworking Machinery Manufacturing' },
      { code: '333611', description: 'Turbine and Turbine Generator Set Units Manufacturing' },
      { code: '333612', description: 'Speed Changer, Industrial High-Speed Drive, and Gear Manufacturing' },
      { code: '333613', description: 'Mechanical Power Transmission Equipment Manufacturing' },
      { code: '333618', description: 'Other Engine Equipment Manufacturing' },
      { code: '333912', description: 'Air and Gas Compressor Manufacturing' },
      { code: '333913', description: 'Measuring and Dispensing Pump Manufacturing' },
      { code: '333914', description: 'Measuring, Dispensing, and Other Pumping Equipment Manufacturing' },
      { code: '333921', description: 'Elevator and Moving Stairway Manufacturing' },
      { code: '333922', description: 'Conveyor and Conveying Equipment Manufacturing' },
      { code: '333923', description: 'Overhead Traveling Crane, Hoist, and Monorail System Manufacturing' },
      { code: '333924', description: 'Industrial Truck, Tractor, Trailer, and Stacker Machinery Manufacturing' },
      { code: '333991', description: 'Power-Driven Handtool Manufacturing' },
      { code: '333992', description: 'Welding and Soldering Equipment Manufacturing' },
      { code: '333993', description: 'Packaging Machinery Manufacturing' },
      { code: '333994', description: 'Industrial Process Furnace and Oven Manufacturing' },
      { code: '333995', description: 'Fluid Power Cylinder and Actuator Manufacturing' },
      { code: '333996', description: 'Fluid Power Pump and Motor Manufacturing' },
      { code: '333997', description: 'Scale and Balance Manufacturing' },
      { code: '333999', description: 'All Other Miscellaneous General Purpose Machinery Manufacturing' }
    ]
  },

  // Professional Services
  PROFESSIONAL_SERVICES: {
    name: 'Professional Services',
    codes: [
      { code: '541110', description: 'Offices of Lawyers' },
      { code: '541120', description: 'Offices of Notaries' },
      { code: '541191', description: 'Title Abstract and Settlement Offices' },
      { code: '541199', description: 'All Other Legal Services' },
      { code: '541211', description: 'Offices of Certified Public Accountants' },
      { code: '541213', description: 'Tax Preparation Services' },
      { code: '541214', description: 'Payroll Services' },
      { code: '541219', description: 'Other Accounting Services' },
      { code: '541310', description: 'Architectural Services' },
      { code: '541320', description: 'Landscape Architectural Services' },
      { code: '541330', description: 'Engineering Services' },
      { code: '541340', description: 'Drafting Services' },
      { code: '541350', description: 'Building Inspection Services' },
      { code: '541360', description: 'Geophysical Surveying and Mapping Services' },
      { code: '541370', description: 'Surveying and Mapping (except Geophysical) Services' },
      { code: '541380', description: 'Testing Laboratories' },
      { code: '541410', description: 'Interior Design Services' },
      { code: '541420', description: 'Industrial Design Services' },
      { code: '541430', description: 'Graphic Design Services' },
      { code: '541490', description: 'Other Specialized Design Services' },
      { code: '541511', description: 'Custom Computer Programming Services' },
      { code: '541512', description: 'Computer Systems Design Services' },
      { code: '541519', description: 'Other Computer Related Services' },
      { code: '541611', description: 'Administrative Management and General Management Consulting Services' },
      { code: '541612', description: 'Human Resources Consulting Services' },
      { code: '541613', description: 'Marketing Consulting Services' },
      { code: '541614', description: 'Process, Physical Distribution, and Logistics Consulting Services' },
      { code: '541618', description: 'Other Management Consulting Services' },
      { code: '541620', description: 'Environmental Consulting Services' },
      { code: '541690', description: 'Other Scientific and Technical Consulting Services' },
      { code: '541715', description: 'Research and Development in the Physical, Engineering, and Life Sciences' },
      { code: '541720', description: 'Research and Development in the Social Sciences and Humanities' },
      { code: '541810', description: 'Advertising Agencies' },
      { code: '541820', description: 'Public Relations Agencies' },
      { code: '541830', description: 'Media Buying Agencies' },
      { code: '541840', description: 'Media Representatives' },
      { code: '541850', description: 'Outdoor Advertising' },
      { code: '541860', description: 'Direct Mail Advertising' },
      { code: '541870', description: 'Advertising Material Distribution Services' },
      { code: '541890', description: 'Other Services Related to Advertising' },
      { code: '541910', description: 'Marketing Research and Public Opinion Polling' },
      { code: '541920', description: 'Photography Studios, Portrait' },
      { code: '541930', description: 'Translation and Interpretation Services' },
      { code: '541940', description: 'Veterinary Services' },
      { code: '541990', description: 'All Other Professional, Scientific, and Technical Services' }
    ]
  },

  // Transportation & Logistics
  TRANSPORTATION: {
    name: 'Transportation & Logistics',
    codes: [
      { code: '481111', description: 'Scheduled Passenger Air Transportation' },
      { code: '481112', description: 'Scheduled Freight Air Transportation' },
      { code: '481211', description: 'Nonscheduled Chartered Passenger Air Transportation' },
      { code: '481212', description: 'Nonscheduled Chartered Freight Air Transportation' },
      { code: '481219', description: 'Other Nonscheduled Air Transportation' },
      { code: '482111', description: 'Line-Haul Railroads' },
      { code: '482112', description: 'Short Line Railroads' },
      { code: '483111', description: 'Deep Sea Freight Transportation' },
      { code: '483112', description: 'Deep Sea Passenger Transportation' },
      { code: '483113', description: 'Coastal and Great Lakes Freight Transportation' },
      { code: '483114', description: 'Coastal and Great Lakes Passenger Transportation' },
      { code: '483211', description: 'Inland Water Freight Transportation' },
      { code: '483212', description: 'Inland Water Passenger Transportation' },
      { code: '484110', description: 'General Freight Trucking, Local' },
      { code: '484121', description: 'General Freight Trucking, Long-Distance, Truckload' },
      { code: '484122', description: 'General Freight Trucking, Long-Distance, Less Than Truckload' },
      { code: '484210', description: 'Used Household and Office Goods Moving' },
      { code: '484220', description: 'Specialized Freight (except Used Goods) Trucking, Local' },
      { code: '484230', description: 'Specialized Freight (except Used Goods) Trucking, Long-Distance' },
      { code: '485111', description: 'Mixed Mode Transit Systems' },
      { code: '485112', description: 'Commuter Rail Systems' },
      { code: '485113', description: 'Bus and Other Motor Vehicle Transit Systems' },
      { code: '485119', description: 'Other Urban Transit Systems' },
      { code: '485210', description: 'Interurban and Rural Bus Transportation' },
      { code: '485310', description: 'Taxi Service' },
      { code: '485320', description: 'Limousine Service' },
      { code: '485410', description: 'School and Employee Bus Transportation' },
      { code: '485510', description: 'Charter Bus Industry' },
      { code: '485991', description: 'Special Needs Transportation' },
      { code: '485999', description: 'All Other Transit and Ground Passenger Transportation' },
      { code: '486110', description: 'Pipeline Transportation of Crude Oil' },
      { code: '486210', description: 'Pipeline Transportation of Natural Gas' },
      { code: '486910', description: 'Pipeline Transportation of Refined Petroleum Products' },
      { code: '486990', description: 'All Other Pipeline Transportation' },
      { code: '487110', description: 'Scenic and Sightseeing Transportation, Land' },
      { code: '487210', description: 'Scenic and Sightseeing Transportation, Water' },
      { code: '487990', description: 'Scenic and Sightseeing Transportation, Other' },
      { code: '488111', description: 'Air Traffic Control' },
      { code: '488119', description: 'Other Airport Operations' },
      { code: '488190', description: 'Other Support Activities for Air Transportation' },
      { code: '488210', description: 'Support Activities for Rail Transportation' },
      { code: '488310', description: 'Port and Harbor Operations' },
      { code: '488320', description: 'Marine Cargo Handling' },
      { code: '488330', description: 'Navigational Services to Shipping' },
      { code: '488390', description: 'Other Support Activities for Water Transportation' },
      { code: '488410', description: 'Motor Vehicle Towing' },
      { code: '488490', description: 'Other Support Activities for Road Transportation' },
      { code: '488510', description: 'Freight Transportation Arrangement' },
      { code: '488991', description: 'Packing and Crating' },
      { code: '488999', description: 'All Other Support Activities for Transportation' },
      { code: '491110', description: 'Postal Service' },
      { code: '492110', description: 'Couriers and Express Delivery Services' },
      { code: '492210', description: 'Local Messengers and Local Delivery' },
      { code: '493110', description: 'General Warehousing and Storage' },
      { code: '493120', description: 'Refrigerated Warehousing and Storage' },
      { code: '493130', description: 'Farm Product Warehousing and Storage' },
      { code: '493190', description: 'Other Warehousing and Storage' }
    ]
  }
};

// Opportunity Types
export const OPPORTUNITY_TYPES = {
  SOLICITATION: {
    name: 'Solicitation',
    types: [
      'Solicitation',
      'Request for Proposal (RFP)',
      'Request for Quote (RFQ)',
      'Request for Information (RFI)',
      'Invitation for Bid (IFB)',
      'Sources Sought',
      'Presolicitation Notice',
      'Combined Synopsis/Solicitation'
    ]
  },
  AWARD: {
    name: 'Award',
    types: [
      'Award Notice',
      'Contract Award',
      'Task Order Award',
      'Delivery Order Award',
      'Modification Award'
    ]
  },
  SET_ASIDE: {
    name: 'Set-Aside Opportunities',
    types: [
      'Small Business Set-Aside',
      '8(a) Business Development Program',
      'Service-Disabled Veteran-Owned Small Business',
      'Women-Owned Small Business',
      'HUBZone Small Business',
      'Veteran-Owned Small Business'
    ]
  },
  SPECIALIZED: {
    name: 'Specialized Opportunities',
    types: [
      'Research and Development',
      'Innovation',
      'Pilot Program',
      'Demonstration Project',
      'Technology Transfer',
      'Joint Venture'
    ]
  }
};

// Helper functions
export function getNAICSCodesByIndustry(industry: keyof typeof NAICS_CODES) {
  return NAICS_CODES[industry]?.codes || [];
}

export function getOpportunityTypesByCategory(category: keyof typeof OPPORTUNITY_TYPES) {
  return OPPORTUNITY_TYPES[category]?.types || [];
}

export function getAllNAICSCodes() {
  return Object.values(NAICS_CODES).flatMap(industry => industry.codes);
}

export function getAllOpportunityTypes() {
  return Object.values(OPPORTUNITY_TYPES).flatMap(category => category.types);
}

export function searchNAICSCodes(query: string) {
  const allCodes = getAllNAICSCodes();
  const lowerQuery = query.toLowerCase();
  
  return allCodes.filter(code => 
    code.code.includes(query) ||
    code.description.toLowerCase().includes(lowerQuery)
  );
}

export function searchOpportunityTypes(query: string) {
  const allTypes = getAllOpportunityTypes();
  const lowerQuery = query.toLowerCase();
  
  return allTypes.filter(type => 
    type.toLowerCase().includes(lowerQuery)
  );
} 