export interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  fields: {
    businessTypes: string[];
    naicsCodes: string[];
    capabilities: string[];
    certifications: string[];
    description: string;
    guidance: string;
  };
  tips: string[];
  estimatedValue: string;
  commonOpportunities: string[];
}

export const PROFILE_TEMPLATES: ProfileTemplate[] = [
  {
    id: 'it-consulting',
    name: 'IT Consulting & Software Development',
    description: 'Technology services, software development, and IT consulting',
    category: 'Technology',
    icon: '💻',
    fields: {
      businessTypes: [
        'Small Business',
        '8(a) Business Development Program',
        'Service-Disabled Veteran-Owned Small Business',
        'Woman-Owned Small Business',
        'HUBZone'
      ],
      naicsCodes: [
        '541511 - Custom Computer Programming Services',
        '541512 - Computer Systems Design Services',
        '541519 - Other Computer Related Services',
        '541611 - Administrative Management and General Management Consulting Services',
        '541618 - Other Management Consulting Services'
      ],
      capabilities: [
        'Software Development',
        'Cloud Computing & Migration',
        'Cybersecurity & Information Assurance',
        'Data Analytics & Business Intelligence',
        'IT Infrastructure & Network Management',
        'DevOps & Agile Development',
        'Mobile Application Development',
        'Web Development & E-commerce',
        'Database Design & Management',
        'Artificial Intelligence & Machine Learning'
      ],
      certifications: [
        'CMMI Level 3 or higher',
        'ISO 27001 (Information Security)',
        'ISO 9001 (Quality Management)',
        'FedRAMP Authorization',
        'DoD Cybersecurity Maturity Model Certification (CMMC)',
        'Microsoft Gold Partner',
        'AWS Advanced Consulting Partner',
        'Google Cloud Partner'
      ],
      description: 'Specialized IT consulting firm providing comprehensive technology solutions to federal agencies. Expertise in software development, cloud migration, cybersecurity, and digital transformation.',
      guidance: 'Focus on specific technologies and methodologies. Include case studies and past performance metrics. Highlight security clearances and certifications.'
    },
    tips: [
      'Emphasize security clearances and certifications',
      'Include specific technology stack expertise',
      'Highlight past performance with federal agencies',
      'Mention cloud platform partnerships',
      'Showcase agile development methodologies'
    ],
    estimatedValue: '$500K - $5M per contract',
    commonOpportunities: [
      'Software Development Services',
      'Cloud Migration Projects',
      'Cybersecurity Assessments',
      'Data Analytics Solutions',
      'IT Infrastructure Modernization'
    ]
  },
  {
    id: 'construction',
    name: 'Construction & Engineering',
    description: 'Building construction, infrastructure, and engineering services',
    category: 'Construction',
    icon: '🏗️',
    fields: {
      businessTypes: [
        'Small Business',
        '8(a) Business Development Program',
        'Service-Disabled Veteran-Owned Small Business',
        'Woman-Owned Small Business',
        'HUBZone'
      ],
      naicsCodes: [
        '236220 - Commercial Building Construction',
        '237310 - Highway, Street, and Bridge Construction',
        '237990 - Other Heavy and Civil Engineering Construction',
        '541330 - Engineering Services',
        '541360 - Geophysical Surveying and Mapping Services'
      ],
      capabilities: [
        'Commercial Building Construction',
        'Infrastructure Development',
        'Highway & Bridge Construction',
        'Environmental Engineering',
        'Structural Engineering',
        'Project Management',
        'Site Development',
        'Renovation & Modernization',
        'Sustainable Construction',
        'Emergency Response Construction'
      ],
      certifications: [
        'ISO 9001 (Quality Management)',
        'ISO 14001 (Environmental Management)',
        'OSHA Safety Certification',
        'LEED Certification',
        'DBE (Disadvantaged Business Enterprise)',
        'State Contractor License',
        'Bonding Capacity'
      ],
      description: 'Experienced construction and engineering firm specializing in federal infrastructure projects, commercial buildings, and civil engineering services.',
      guidance: 'Highlight bonding capacity, safety records, and past performance. Include specific project types and geographic areas of expertise.'
    },
    tips: [
      'Emphasize bonding capacity and financial strength',
      'Include safety records and OSHA compliance',
      'Highlight past performance on similar projects',
      'Mention geographic service areas',
      'Showcase sustainable construction practices'
    ],
    estimatedValue: '$1M - $50M per contract',
    commonOpportunities: [
      'Building Construction',
      'Infrastructure Projects',
      'Engineering Services',
      'Renovation Projects',
      'Emergency Construction'
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical Services',
    description: 'Medical services, healthcare consulting, and medical equipment',
    category: 'Healthcare',
    icon: '🏥',
    fields: {
      businessTypes: [
        'Small Business',
        '8(a) Business Development Program',
        'Service-Disabled Veteran-Owned Small Business',
        'Woman-Owned Small Business',
        'HUBZone'
      ],
      naicsCodes: [
        '621111 - Offices of Physicians (except Mental Health Specialists)',
        '621210 - Offices of Dentists',
        '621310 - Offices of Chiropractors',
        '621320 - Offices of Optometrists',
        '621330 - Offices of Mental Health Practitioners (except Physicians)',
        '621340 - Physical, Occupational and Speech Therapists and Audiologists',
        '621511 - Medical Laboratories',
        '621512 - Diagnostic Imaging Centers'
      ],
      capabilities: [
        'Primary Care Services',
        'Specialty Medical Services',
        'Diagnostic Testing',
        'Mental Health Services',
        'Physical Therapy',
        'Medical Equipment & Supplies',
        'Healthcare Consulting',
        'Telemedicine Services',
        'Preventive Care',
        'Emergency Medical Services'
      ],
      certifications: [
        'Joint Commission Accreditation',
        'Medicare/Medicaid Certification',
        'State Medical License',
        'HIPAA Compliance',
        'CLIA Certification (for labs)',
        'ISO 13485 (Medical Devices)',
        'Board Certifications'
      ],
      description: 'Comprehensive healthcare services provider specializing in federal healthcare programs, medical consulting, and specialized medical services.',
      guidance: 'Emphasize accreditations, certifications, and compliance with healthcare regulations. Include patient outcomes and quality metrics.'
    },
    tips: [
      'Highlight healthcare accreditations and certifications',
      'Include patient satisfaction metrics',
      'Emphasize HIPAA compliance',
      'Showcase specialized medical expertise',
      'Mention telemedicine capabilities'
    ],
    estimatedValue: '$100K - $2M per contract',
    commonOpportunities: [
      'Medical Services',
      'Healthcare Consulting',
      'Medical Equipment',
      'Mental Health Services',
      'Preventive Care Programs'
    ]
  },
  {
    id: 'logistics',
    name: 'Logistics & Supply Chain',
    description: 'Transportation, warehousing, and supply chain management',
    category: 'Logistics',
    icon: '🚚',
    fields: {
      businessTypes: [
        'Small Business',
        '8(a) Business Development Program',
        'Service-Disabled Veteran-Owned Small Business',
        'Woman-Owned Small Business',
        'HUBZone'
      ],
      naicsCodes: [
        '484110 - General Freight Trucking, Local',
        '484121 - General Freight Trucking, Long-Distance, Truckload',
        '484122 - General Freight Trucking, Long-Distance, Less Than Truckload',
        '493110 - General Warehousing and Storage',
        '541614 - Process, Physical Distribution, and Logistics Consulting Services'
      ],
      capabilities: [
        'Freight Transportation',
        'Warehousing & Distribution',
        'Supply Chain Management',
        'Inventory Management',
        'Customs & International Shipping',
        'Cold Chain Logistics',
        'Express Delivery Services',
        'Fleet Management',
        'Reverse Logistics',
        'Last-Mile Delivery'
      ],
      certifications: [
        'ISO 9001 (Quality Management)',
        'C-TPAT (Customs-Trade Partnership Against Terrorism)',
        'HACCP (Hazard Analysis Critical Control Point)',
        'DOT Authority',
        'MC Authority',
        'SmartWay Transport Partnership',
        'ISO 28000 (Supply Chain Security)'
      ],
      description: 'Comprehensive logistics and supply chain management services specializing in federal freight, warehousing, and distribution solutions.',
      guidance: 'Highlight fleet size, geographic coverage, and specialized equipment. Include safety records and compliance certifications.'
    },
    tips: [
      'Emphasize fleet size and geographic coverage',
      'Include safety records and compliance',
      'Highlight specialized equipment and capabilities',
      'Showcase technology integration',
      'Mention sustainability initiatives'
    ],
    estimatedValue: '$200K - $10M per contract',
    commonOpportunities: [
      'Freight Transportation',
      'Warehousing Services',
      'Supply Chain Consulting',
      'Express Delivery',
      'Cold Chain Logistics'
    ]
  },
  {
    id: 'professional-services',
    name: 'Professional Services & Consulting',
    description: 'Management consulting, legal services, and professional support',
    category: 'Professional Services',
    icon: '📋',
    fields: {
      businessTypes: [
        'Small Business',
        '8(a) Business Development Program',
        'Service-Disabled Veteran-Owned Small Business',
        'Woman-Owned Small Business',
        'HUBZone'
      ],
      naicsCodes: [
        '541611 - Administrative Management and General Management Consulting Services',
        '541612 - Human Resources Consulting Services',
        '541613 - Marketing Consulting Services',
        '541614 - Process, Physical Distribution, and Logistics Consulting Services',
        '541618 - Other Management Consulting Services',
        '541990 - All Other Professional, Scientific, and Technical Services'
      ],
      capabilities: [
        'Strategic Planning',
        'Change Management',
        'Process Improvement',
        'Training & Development',
        'Financial Consulting',
        'Legal Services',
        'Human Resources',
        'Marketing & Communications',
        'Project Management',
        'Risk Management'
      ],
      certifications: [
        'ISO 9001 (Quality Management)',
        'PMP (Project Management Professional)',
        'Six Sigma Certification',
        'Lean Certification',
        'State Bar License (for legal services)',
        'HRCI Certification',
        'SHRM Certification'
      ],
      description: 'Professional services firm providing strategic consulting, management support, and specialized expertise to federal agencies.',
      guidance: 'Focus on specific expertise areas and methodologies. Include case studies and measurable outcomes.'
    },
    tips: [
      'Emphasize specific expertise areas',
      'Include case studies and outcomes',
      'Highlight professional certifications',
      'Showcase methodology expertise',
      'Mention industry-specific experience'
    ],
    estimatedValue: '$100K - $3M per contract',
    commonOpportunities: [
      'Management Consulting',
      'Training Services',
      'Legal Services',
      'HR Consulting',
      'Strategic Planning'
    ]
  },
  {
    id: 'research-development',
    name: 'Research & Development',
    description: 'Scientific research, development, and innovation services',
    category: 'Research',
    icon: '🔬',
    fields: {
      businessTypes: [
        'Small Business',
        '8(a) Business Development Program',
        'Service-Disabled Veteran-Owned Small Business',
        'Woman-Owned Small Business',
        'HUBZone'
      ],
      naicsCodes: [
        '541715 - Research and Development in the Physical, Engineering, and Life Sciences',
        '541720 - Research and Development in the Social Sciences and Humanities',
        '541330 - Engineering Services',
        '541690 - Other Scientific and Technical Consulting Services'
      ],
      capabilities: [
        'Scientific Research',
        'Technology Development',
        'Laboratory Services',
        'Data Analysis',
        'Prototype Development',
        'Clinical Trials',
        'Environmental Research',
        'Materials Science',
        'Biotechnology',
        'Artificial Intelligence Research'
      ],
      certifications: [
        'ISO 17025 (Laboratory Accreditation)',
        'CLIA Certification (for medical labs)',
        'Good Laboratory Practice (GLP)',
        'ISO 9001 (Quality Management)',
        'FDA Registration',
        'University Research Partnerships',
        'Patent Portfolio'
      ],
      description: 'Innovative research and development firm specializing in scientific research, technology development, and breakthrough solutions.',
      guidance: 'Highlight research capabilities, patents, and partnerships. Include publication history and innovation metrics.'
    },
    tips: [
      'Emphasize research capabilities and patents',
      'Include publication history',
      'Highlight university partnerships',
      'Showcase innovation metrics',
      'Mention specialized equipment'
    ],
    estimatedValue: '$500K - $10M per contract',
    commonOpportunities: [
      'Scientific Research',
      'Technology Development',
      'Laboratory Services',
      'Clinical Trials',
      'Innovation Consulting'
    ]
  }
];

export const getTemplateById = (id: string): ProfileTemplate | undefined => {
  return PROFILE_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): ProfileTemplate[] => {
  return PROFILE_TEMPLATES.filter(template => template.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(PROFILE_TEMPLATES.map(template => template.category))];
};

export const searchTemplates = (query: string): ProfileTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return PROFILE_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.category.toLowerCase().includes(lowercaseQuery) ||
    template.fields.capabilities.some(cap => cap.toLowerCase().includes(lowercaseQuery))
  );
}; 