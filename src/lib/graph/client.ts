import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI || 'neo4j+s://your-instance.databases.neo4j.io';
const user = process.env.NEO4J_USERNAME || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'your_password';

let driver: neo4j.Driver | null = null;

try {
  if (process.env.NEO4J_URI) {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
} catch (error) {
  console.warn('Failed to initialize Neo4j driver:', error);
}

export function getSession() {
  if (!driver) {
    console.warn('Neo4j driver not initialized. Please configure NEO4J_URI.');
    return null;
  }
  return driver.session();
}

export async function closeDriver() {
  if (driver) {
    await driver.close();
  }
}
