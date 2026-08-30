import neo4j, { Driver, Session } from 'neo4j-driver';

let driver: Driver | null = null;

const NEO4J_URI = process.env.NEO4J_URI;
const NEO4J_USERNAME = process.env.NEO4J_USERNAME;
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD;

/**
 * Initializes and returns a Neo4j driver singleton.
 * If credentials are missing, it returns null and logs a warning.
 */
export function getDriver(): Driver | null {
  if (driver) {
    return driver;
  }

  if (!NEO4J_URI || !NEO4J_USERNAME || !NEO4J_PASSWORD) {
    console.warn('Neo4j credentials are not set. Graph matching will be unavailable.');
    return null;
  }

  try {
    driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD),
      {
        disableLosslessIntegers: true, // Simplified number handling for TS
        maxConnectionPoolSize: 50,
      }
    );
    return driver;
  } catch (error) {
    console.error('Failed to initialize Neo4j driver:', error);
    return null;
  }
}

/**
 * Gets a new session from the driver. 
 * Returns null if the driver cannot be initialized.
 */
export function getSession(): Session | null {
  const drv = getDriver();
  if (!drv) return null;
  return drv.session();
}

/**
 * Closes the Neo4j driver. Should be called on application shutdown.
 */
export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
