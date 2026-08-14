import axios from 'axios';
import { translateText } from './translation.service.js';
import { HttpsProxyAgent } from 'https-proxy-agent';

let accessToken = '';
let tokenExpiration = 0;

const FATSECRET_TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const FATSECRET_API_URL = 'https://platform.fatsecret.com/rest/server.api';

const PROXY_HOST = process.env.PROXY_HOST;
const PROXY_PORT = process.env.PROXY_PORT;
const PROXY_USER = process.env.PROXY_USER;
const PROXY_PASS = process.env.PROXY_PASS;

let proxyAgent: HttpsProxyAgent<string> | undefined = undefined;

if (PROXY_HOST && PROXY_PORT && PROXY_USER && PROXY_PASS) {
    proxyAgent = new HttpsProxyAgent(`http://${PROXY_USER}:${PROXY_PASS}@${PROXY_HOST}:${PROXY_PORT}`);
}

const getMacro = (desc: string, regex: RegExp): number => {
    const match = desc.match(regex);
    return match && match[1] ? parseFloat(match[1]) : 0;
};

const extractPieceName = (desc: string): string | undefined => {
    const portionMatch = desc.match(/^Per\s+(.*?)\s+-/i);
    if (portionMatch && portionMatch[1]) {
        const portion = portionMatch[1].toLowerCase().trim();
        if (!['100g', '100 g', '100ml', '100 ml'].includes(portion)) {
            return portion;
        }
    }
    return undefined;
};

async function getAccessToken(): Promise<string> {
    const CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
    const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET are required in .env');
    }

    if (accessToken && Date.now() < tokenExpiration) {
        return accessToken;
    }

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(
        FATSECRET_TOKEN_URL,
        'grant_type=client_credentials&scope=basic',
        {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            httpsAgent: proxyAgent
        }
    );

    accessToken = response.data.access_token;
    tokenExpiration = Date.now() + (response.data.expires_in - 60) * 1000;

    return accessToken;
}

const fetchFromFatSecret = async (query: string, token: string) => {
    return await axios.get(FATSECRET_API_URL, {
        params: {
            method: 'foods.search',
            search_expression: query,
            format: 'json',
            max_results: 15
        },
        headers: {
            'Authorization': `Bearer ${token}`
        },
        httpsAgent: proxyAgent
    });
};

export async function searchProductsInFatSecret(query: string, userLang: string = 'uk') {
    let searchQuery = query;

    if (userLang === 'uk') {
        const translatedQuery = await translateText(query, 'en-US');
        searchQuery = (Array.isArray(translatedQuery) ? translatedQuery[0] : translatedQuery) || query;
    }

    let token = await getAccessToken();
    let response;

    try {
        response = await fetchFromFatSecret(searchQuery, token);
    } catch {
        return [];
    }

    if (response.data?.error) {
        const isTokenError = response.data.error.code === 5 || response.data.error.message?.toLowerCase().includes('token');

        if (isTokenError) {
            accessToken = '';
            tokenExpiration = 0;
            token = await getAccessToken();
            response = await fetchFromFatSecret(searchQuery, token);
        } else {
            return [];
        }
    }

    const foods = response.data?.foods?.food;
    if (!foods) {
        return [];
    }

    const foodArray = Array.isArray(foods) ? foods : [foods];
    let translatedNames: string[] = [];

    if (userLang === 'uk') {
        const foodNames = foodArray.map((food: any) => food.food_name);
        const translationResult = await translateText(foodNames, 'uk');
        translatedNames = Array.isArray(translationResult) ? translationResult : [translationResult];
    }

    return foodArray.map((food: any, index: number) => {
        const desc = food.food_description || '';
        const finalName = userLang === 'uk' && translatedNames[index] ? translatedNames[index] : food.food_name;

        return {
            id: food.food_id,
            externalId: food.food_id,
            name: finalName,
            calories: getMacro(desc, /Calories:\s*([\d.]+)kcal/i),
            protein: getMacro(desc, /Protein:\s*([\d.]+)g/i),
            fat: getMacro(desc, /Fat:\s*([\d.]+)g/i),
            carbs: getMacro(desc, /Carbs:\s*([\d.]+)g/i),
            description: desc,
            pieceName: extractPieceName(desc),
            isGlobal: true
        };
    });
}