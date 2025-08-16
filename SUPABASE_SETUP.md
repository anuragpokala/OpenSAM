# Supabase Setup Guide for OpenSAM AI

## 🎯 Overview

This guide will help you connect OpenSAM AI to your Supabase project at:
`https://bjzzmijzqxensbvndgld.supabase.co`

## 📊 Project Details

- **Project URL**: `https://bjzzmijzqxensbvndgld.supabase.co`
- **API Key Variable**: `SUPA_BASE_API_KEY`
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth (optional)

## 🔧 Configuration Steps

### 1. Get Your Supabase API Key

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to your project: `bjzzmijzqxensbvndgld`
3. Go to **Settings** → **API**
4. Copy your **anon public** API key (not the service_role key)

### 2. Update Environment Variables

Add this to your `.env` file:

```bash
# Supabase Configuration
SUPA_BASE_API_KEY=your_actual_supabase_api_key_here
```

### 3. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** to execute the schema

### 4. Test the Connection

Run the test script:
```bash
curl http://localhost:3001/api/test-supabase
```

Or visit in browser:
`http://localhost:3001/api/test-supabase`

## 🗄️ Database Schema

The schema includes these tables:

### **company_profiles**
- Company capability profiles
- NAICS codes and capabilities
- User-specific data

### **opportunities**
- SAM.gov opportunities
- Searchable by NAICS, state, set-aside
- Active/inactive status

### **working_lists**
- User-created lists of opportunities
- Custom names and descriptions

### **working_list_items**
- Items within working lists
- Notes and status tracking

### **chat_sessions**
- AI chat conversation sessions
- User-specific chat history

### **chat_messages**
- Individual messages within chat sessions
- Role-based (user/assistant/system)

## 🔒 Security Features

### Row Level Security (RLS)
- **Company Profiles**: Users can only modify their own profiles
- **Working Lists**: Users can only access their own lists
- **Chat Sessions**: Users can only access their own conversations
- **Opportunities**: Read-only for all users

### Authentication
- Optional Supabase Auth integration
- User-specific data isolation
- Secure API access

## 🧪 Testing the Connection

### Option 1: API Endpoint
```bash
curl http://localhost:3001/api/test-supabase
```

### Option 2: Browser Test
Visit: `http://localhost:3001/api/test-supabase`

### Option 3: Direct Supabase Test
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bjzzmijzqxensbvndgld.supabase.co',
  'your_api_key_here'
);

const { data, error } = await supabase
  .from('opportunities')
  .select('*')
  .limit(5);

console.log('Data:', data);
console.log('Error:', error);
```

## 📊 Expected Results

If successful, you should see:
```json
{
  "success": true,
  "message": "Supabase connection successful",
  "config": {
    "url": "https://bjzzmijzqxensbvndgld.supabase.co",
    "hasApiKey": true
  },
  "database": {
    "totalTables": 6,
    "openSAMTables": {
      "expected": ["company_profiles", "opportunities", "working_lists", "working_list_items", "chat_sessions", "chat_messages"],
      "existing": ["company_profiles", "opportunities", "working_lists", "working_list_items", "chat_sessions", "chat_messages"],
      "missing": []
    }
  },
  "data": {
    "companyProfiles": 0,
    "opportunities": 3
  }
}
```

## 🚀 Enable Supabase Features

Once connected, the following features will work:

1. **Company Profile Storage** - Save and retrieve company profiles
2. **Opportunity Management** - Store and search opportunities
3. **Working Lists** - Create and manage opportunity lists
4. **Chat History** - Persistent chat conversations
5. **User Data Isolation** - Secure user-specific data
6. **Real-time Updates** - Live data synchronization

## 🔧 Integration Points

### Company Profiles
- Store company capabilities and NAICS codes
- User-specific profile management
- Integration with vector matching

### Opportunities
- Store SAM.gov opportunities
- Search and filter capabilities
- Integration with working lists

### Working Lists
- User-created opportunity collections
- Notes and status tracking
- Export and sharing capabilities

### Chat System
- Persistent conversation history
- Context-aware AI responses
- User-specific chat sessions

## 🔍 Troubleshooting

### API Key Issues
- Make sure `SUPA_BASE_API_KEY` is set correctly
- Verify the API key is the **anon public** key (not service_role)
- Check if the key is active in Supabase dashboard

### Schema Issues
- Run the `supabase-schema.sql` script in Supabase SQL Editor
- Check if all tables were created successfully
- Verify RLS policies are in place

### Connection Errors
- Check your internet connection
- Verify Supabase service status
- Ensure the project URL is correct

### RLS Policy Issues
- Check if RLS is enabled on all tables
- Verify policy definitions in Supabase dashboard
- Test with authenticated vs anonymous users

## 📝 Next Steps

After successful connection:

1. **Restart the development server** to pick up new environment variables
2. **Test company profile creation** in the dashboard
3. **Try creating working lists** with opportunities
4. **Test chat functionality** with persistent history
5. **Verify data isolation** between users

## 🎉 Success!

Once connected, you'll have:
- ✅ Persistent data storage
- ✅ User-specific data isolation
- ✅ Real-time data synchronization
- ✅ Secure API access
- ✅ Scalable database backend
- ✅ Built-in authentication (optional)

## 🔗 Useful Links

- [Supabase Dashboard](https://app.supabase.com/project/bjzzmijzqxensbvndgld)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security) 