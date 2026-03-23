import type { Door } from '../../types';
import type { ContactProviderInterface, ContactRevealResult } from './types';

function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
];

const EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
  'aol.com', 'protonmail.com', 'mail.com',
];

export class MockContactProvider implements ContactProviderInterface {
  name = 'Mock Contact Provider';

  async revealContact(door: Door): Promise<ContactRevealResult> {
    const seed = hashString(door.id);
    const random = seededRandom(seed);

    const firstName = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const fullName = `${firstName} ${lastName}`;

    const areaCode = 200 + Math.floor(random() * 800);
    const exchange = 200 + Math.floor(random() * 800);
    const subscriber = 1000 + Math.floor(random() * 9000);
    const phone = `(${areaCode}) ${exchange}-${subscriber}`;

    const phones: string[] = [phone];
    if (random() > 0.6) {
      const areaCode2 = 200 + Math.floor(random() * 800);
      const exchange2 = 200 + Math.floor(random() * 800);
      const subscriber2 = 1000 + Math.floor(random() * 9000);
      phones.push(`(${areaCode2}) ${exchange2}-${subscriber2}`);
    }

    const emailDomain = EMAIL_DOMAINS[Math.floor(random() * EMAIL_DOMAINS.length)];
    const emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const email = `${emailPrefix}@${emailDomain}`;

    const emails: string[] = [email];
    if (random() > 0.7) {
      const altDomain = EMAIL_DOMAINS[Math.floor(random() * EMAIL_DOMAINS.length)];
      emails.push(`${firstName.toLowerCase()}${Math.floor(random() * 100)}@${altDomain}`);
    }

    return {
      name: fullName,
      phones,
      emails,
      raw: {
        provider: 'mock',
        firstName,
        lastName,
        confidence: 0.85 + random() * 0.15,
        lastVerified: new Date(Date.now() - Math.floor(random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
        propertyOwner: random() > 0.3,
        yearsAtAddress: Math.floor(random() * 20),
      },
    };
  }

  async estimateCost(): Promise<number> {
    return 1;
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
}
