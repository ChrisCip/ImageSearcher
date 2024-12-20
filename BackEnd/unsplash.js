import { createApi } from 'unsplash-js';
import nodeFetch from 'node-fetch';
import config from './config.js';

const unsplash = createApi({
  accessKey: config.UNSPLASH_ACCESS_KEY || 'jpQYFMw2Vau9zyUWlCkhTWjjJ1LUH1ioL4z5nNjdRVo',
  fetch: nodeFetch,
});

export async function searchImages(query) {
  try {
    console.log('Searching for:', query);
    const result = await unsplash.search.getPhotos({
      query: query,
      page: 1,
      perPage: 30,
    });
    
    if (result.errors) {
      throw new Error(result.errors[0]);
    }
    
    return result.response.results;
  } catch (error) {
    console.error('Error in searchImages:', error);
    throw error;
  }
}

export const unsplashClient = unsplash; 