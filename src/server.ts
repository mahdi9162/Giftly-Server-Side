import app from './app';
import config from './config';
import { connectDB } from './lib/connectDB';

async function main() {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(`Server is listening on port ${config.port}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

main();
