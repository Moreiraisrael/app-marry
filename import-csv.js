const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function importCsv() {
  console.log('Reading CSV...');
  const csvText = fs.readFileSync('./src/lib/actions/PartnerStore_export.csv', 'utf8');
  
  // Simple CSV parser just skipping header
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  const headers = lines.shift();
  
  // Create records
  // Columns from CSV: name,link,logo,description,is_active,category,id,created_date,updated_date,created_by_id,created_by,is_sample
  // Data columns in partner_stores: name, logo_url, store_link, category, is_active
  const records = [];
  
  for (const line of lines) {
    // Regex to properly split CSV respecting quotes
    const regex = /"([^"]*)"|([^,]+)/g;
    const values = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match[1] !== undefined) {
        values.push(match[1]); // Matched quoted string
      } else if (match[2] !== undefined) {
        values.push(match[2].trim()); // Matched unquoted string
      }
    }
    
    // In case there are empty fields at the end not matched by regex (e.g. empty strings)
    // The CSV has 12 fields exactly
    const parts = line.split(',');
    
    // Quick and dirty manual assignment by index in matched values
    // Row might look like: "Loccitane Au Bresil","https://tidd.ly/4li0a48","image_url","","true","outros","..."
    // Because some descriptions could be empty string like "", match[1] handles them.
    if (values.length >= 6) {
      records.push({
        name: values[0],
        store_link: values[1] || null,
        logo_url: values[2] || null,
        // We skip description
        is_active: values[4] === 'true',
        category: values[5] || 'outros',
      });
    }
  }

  console.log(`Prepared ${records.length} records. Uploading to Supabase...`);
  
  const { data, error } = await supabase
    .from('partner_stores')
    .insert(records);

  if (error) {
    console.error('Error uploading:', error);
  } else {
    console.log('Successfully uploaded records!');
  }
}

importCsv();
