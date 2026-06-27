const fs = require('fs/promises');
const path = require('path');
const cheerio = require('cheerio');

const dataPath = path.join(__dirname, 'data', 'scamAlerts.json');
const sources = [
  {
    name: 'ScamWatch News Alerts',
    url: 'https://www.scamwatch.gov.au/news-alerts'
  },
  {
    name: 'FTC Scam Alerts',
    url: 'https://consumer.ftc.gov/features/scam-alerts'
  }
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveUrl(base, href) {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function inferCategory(text) {
  const normalized = text.toLowerCase();
  if (normalized.includes('bank') || normalized.includes('payment') || normalized.includes('account')) {
    return 'Banking';
  }
  if (normalized.includes('job') || normalized.includes('recruitment') || normalized.includes('employment')) {
    return 'Job';
  }
  if (normalized.includes('crypto') || normalized.includes('investment') || normalized.includes('wallet')) {
    return 'Investment';
  }
  if (normalized.includes('romance') || normalized.includes('dating') || normalized.includes('love')) {
    return 'Romance';
  }
  if (normalized.includes('delivery') || normalized.includes('parcel') || normalized.includes('shipment')) {
    return 'Delivery';
  }
  if (normalized.includes('phish') || normalized.includes('login') || normalized.includes('password')) {
    return 'Phishing';
  }
  if (normalized.includes('social') || normalized.includes('platform') || normalized.includes('chat')) {
    return 'Social Media';
  }
  return 'Others';
}

function mapRisk(text) {
  const normalized = text.toLowerCase();
  if (normalized.includes('bank') || normalized.includes('investment') || normalized.includes('wallet') || normalized.includes('payment')) {
    return 'High';
  }
  if (normalized.includes('job') || normalized.includes('romance') || normalized.includes('delivery')) {
    return 'Medium';
  }
  return 'Low';
}

function getImageForCategory(category) {
  const defaults = {
    Banking: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=450&fit=crop',
    Job: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=450&fit=crop',
    Investment: 'https://images.unsplash.com/photo-1590538349996-0bed4edf99ff?w=800&h=450&fit=crop',
    Romance: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=450&fit=crop',
    Delivery: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800&h=450&fit=crop',
    Phishing: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=450&fit=crop',
    'Social Media': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&h=450&fit=crop',
    Others: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop'
  };
  return defaults[category] || defaults.Others;
}

function generateWarningSigns() {
  return [
    'Unsolicited messages from unknown senders',
    'Requests for sensitive information',
    'Pressure to act immediately'
  ];
}

function generateRecommendedActions() {
  return [
    'Do not click suspicious links',
    'Verify the sender with official channels',
    'Report the scam to authorities'
  ];
}

function generateProtectionTips() {
  return [
    'Use official websites and apps for account access',
    'Keep software and passwords up to date',
    'Talk to a trusted friend or advisor before sending money'
  ];
}

function generateResponseActions() {
  return [
    'Stop communication with the sender',
    'Save any evidence and screenshots',
    'Report the scam to your local consumer protection agency'
  ];
}

function buildAlert({ title, url, summary, date, category, source }) {
  const slug = slugify(title || `${source}-${Date.now()}`);
  const reportedDate = date || 'Today';
  return {
    id: slug,
    slug,
    title,
    articleHeadline: title,
    reportedDate,
    readTime: `${Math.max(3, Math.ceil((summary || '').length / 120))} min read`,
    views: 8000 + Math.floor(Math.random() * 14000),
    author: `${source} Advisory`,
    risk: mapRisk(title + ' ' + summary),
    category: category || inferCategory(title + ' ' + summary),
    description: summary || `New scam advisory from ${source}.`,
    image: getImageForCategory(category || inferCategory(title + ' ' + summary)),
    warningSigns: generateWarningSigns(),
    recommendedActions: generateRecommendedActions(),
    articleContent: {
      overview: [
        summary || `A new scam advisory was published by ${source}.`,
        `This alert provides guidance about the latest scam patterns and how to stay protected.`
      ],
      howItWorks: [
        `Scammers are increasingly using tactics described in ${source} to target consumers.`,
        `The scam typically begins with an unsolicited contact and ends with a request for money or personal details.`
      ],
      steps: [
        'The scam begins with outreach through a message or email.',
        'The victim is asked to verify information or send money via a fake channel.',
        'The scammer attempts to harvest credentials, payment details, or direct transfers.'
      ],
      warningSigns: generateWarningSigns(),
      protectionTips: generateProtectionTips(),
      whatToDo: generateResponseActions(),
      resources: [
        { label: `${source} Advisory`, url }
      ]
    }
  };
}

function parseList($, baseUrl) {
  const items = [];
  const listSelectors = ['.views-row', 'article', '.tile', '.card', '.node', '.teaser'];

  for (const selector of listSelectors) {
    const nodes = $(selector).toArray();
    if (nodes.length > 0) {
      nodes.slice(0, 8).forEach((node) => {
        const anchor = $(node).find('h2 a, h3 a, a').first();
        const title = anchor.text().trim();
        const href = resolveUrl(baseUrl, anchor.attr('href'));
        const summary = $(node).find('p').first().text().trim() || $(node).find('.summary, .field--name-body').text().trim();
        const date = $(node).find('time').first().text().trim() || $(node).find('.date, .created, .field--name-created').first().text().trim();

        if (title && href) {
          items.push({ title, url: href, summary, date });
        }
      });
      if (items.length) {
        return items;
      }
    }
  }

  return items;
}

function parseFallback($, baseUrl) {
  const items = [];
  $('a').each((_, anchor) => {
    const title = cheerio(anchor).text().trim();
    const href = cheerio(anchor).attr('href');
    if (title.length > 30 && href && !href.startsWith('#') && !title.toLowerCase().includes('read more')) {
      items.push({ title, url: resolveUrl(baseUrl, href), summary: '', date: '' });
    }
  });
  return items.slice(0, 6);
}

async function fetchHtml(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: ${response.status}`);
  }
  return response.text();
}

async function scrapeSource(source) {
  console.log(`Scraping ${source.name}...`);
  try {
    const html = await fetchHtml(source.url);
    const $ = cheerio.load(html);
    const parsed = parseList($, source.url);
    if (parsed.length === 0) {
      return parseFallback($, source.url).map((item) => ({ ...item, source: source.name }));
    }
    return parsed.map((item) => ({ ...item, source: source.name }));
  } catch (error) {
    console.warn(`Could not scrape ${source.name}:`, error.message);
    return [];
  }
}

async function runScraper() {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  const alerts = [];

  for (const source of sources) {
    const scraped = await scrapeSource(source);
    scraped.forEach((item) => {
      if (item.title && item.url) {
        alerts.push(buildAlert(item));
      }
    });
  }

  const uniqueAlerts = Array.from(new Map(alerts.map((alert) => [alert.slug, alert])).values());

  if (uniqueAlerts.length === 0) {
    console.warn('No alerts scraped. Keeping existing data if available.');
    return;
  }

  await fs.writeFile(dataPath, JSON.stringify(uniqueAlerts, null, 2), 'utf-8');
  console.log(`Saved ${uniqueAlerts.length} scam alerts to ${dataPath}`);
}

runScraper().catch((error) => {
  console.error('Scraper failed:', error);
  process.exit(1);
});
