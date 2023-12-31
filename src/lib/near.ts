import { HighScore } from '@/shared-types';
import sortScores from './sort-scores';
import { LOCAL_STORAGE_NAMESPACE, getItem, removeItem } from './local-storage';

export const NEAR_CONSENT_KEY = 'useNear';

const CONTRACT_ID = 'js13k23-portolani.testnet';

const NK = {
   account_id: 'account_id',
   account: 'account',
   accountId: 'accountId',
   actions: 'actions',
   args_base64: 'args_base64',
   BrowserLocalStorageKeyStore: 'BrowserLocalStorageKeyStore',
   connection: 'connection',
   contractId: 'contractId',
   date: 'date',
   days: 'days',
   explorerUrl: 'explorerUrl',
   finality: 'finality',
   functionCall: 'functionCall',
   isSignedInAsync: 'isSignedInAsync',
   keyStore: 'keyStore',
   keyStores: 'keyStores',
   method_name: 'method_name',
   methodNames: 'methodNames',
   networkId: 'networkId',
   nodeUrl: 'nodeUrl',
   ports: 'ports',
   provider: 'provider',
   query: 'query',
   receiverId: 'receiverId',
   request_type: 'request_type',
   requestSignIn: 'requestSignIn',
   result: 'result',
   signAndSendTransaction: 'signAndSendTransaction',
   signOut: 'signOut',
   tiles: 'tiles',
   transactions: 'transactions',
   WalletConnection: 'WalletConnection',
   walletUrl: 'walletUrl',
   connect: 'connect',
   getAccountId: 'getAccountId',
   sender: 'sender',
};

export function isNearAvailable(): boolean {
   return (window as any)['nearApi'];
}

export async function loadNear(): Promise<boolean> {
   if (!getItem(NEAR_CONSENT_KEY, false)) {
      return false;
   }

   if (isNearAvailable()) {
      return true;
   }

   return new Promise((resolve) => {
      const el = document.createElement('script');

      el.src = 'https://cdn.jsdelivr.net/npm/near-api-js@2.1.4/dist/near-api-js.js';
      el.addEventListener('load', () => {
         resolve(true);
      });
      document.body.appendChild(el);
   });
}

function getNearClient(): Promise<any> {
   return nearApi[NK.connect]({
      [NK.nodeUrl]: 'https://rpc.testnet.near.org',
      [NK.walletUrl]: 'https://testnet.mynearwallet.com',
      [NK.explorerUrl]: 'https://explorer.testnet.near.org',
      [NK.networkId]: 'testnet',
      [NK.keyStore]: new nearApi[NK.keyStores][NK.BrowserLocalStorageKeyStore](window.localStorage, LOCAL_STORAGE_NAMESPACE)
   });
}

async function getWalletConnection(): Promise<any> {
   return new nearApi[NK.WalletConnection](await getNearClient(), LOCAL_STORAGE_NAMESPACE);
}

export async function isSignedIn(): Promise<boolean> {
   if (!isNearAvailable()) {
      return false;
   }

   const walletConnection = await getWalletConnection();

   return walletConnection[NK.isSignedInAsync]();
}

export async function getNearAccount(): Promise<string> {
   if (!isNearAvailable()) {
      return 'unknown';
   }

   const walletConnection = await getWalletConnection();

   return walletConnection[NK.getAccountId]();
}

export async function signOut(): Promise<void> {
   removeItem(NEAR_CONSENT_KEY);

   if (!isNearAvailable()) {
      return;
   }

   const walletConnection = await getWalletConnection();

   await walletConnection[NK.signOut]();
   location.reload();
}

export async function signIn(): Promise<void> {
   if (!isNearAvailable()) {
      return;
   }

   const walletConnection = await getWalletConnection();

   return walletConnection[NK.requestSignIn]({ [NK.contractId]: CONTRACT_ID, [NK.methodNames]: [ 'submit_score' ] });
}

export async function getHighScores(): Promise<Record<string, HighScore[]>> {
   if (!isNearAvailable()) {
      return {};
   }

   const res = await (await getNearClient())[NK.connection][NK.provider][NK.query]({
      [NK.request_type]: 'call_function',
      [NK.account_id]: CONTRACT_ID,
      [NK.method_name]: 'get_scores',
      [NK.args_base64]: 'e30=',
      [NK.finality]: 'optimistic',
   });

   const decoder = new TextDecoder('utf-8');

   return (JSON.parse(decoder.decode(new Uint8Array(res[NK.result]))) as any[])
      .reduce((memo, entry) => {
         if (!memo[entry[NK.date]]) {
            memo[entry[NK.date]] = [];
         }

         const score: HighScore = {
            date: entry[NK.date],
            ports: entry[NK.ports],
            days: entry[NK.days],
            tiles: entry[NK.tiles],
            sender: entry[NK.sender],
         };

         memo[entry[NK.date]].push(score);
         sortScores(memo[entry[NK.date]]);

         return memo;
      }, {} as Record<string, HighScore[]>);
}

export async function submitScore(date: string, score: Pick<HighScore, 'ports' | 'tiles' | 'days'>): Promise<void> {
   const walletConnection = await getWalletConnection();

   await walletConnection[NK.account]()[NK.signAndSendTransaction]({
      [NK.receiverId]: CONTRACT_ID,
      [NK.actions]: [
         nearApi[NK.transactions][NK.functionCall]('submit_score', {
            [NK.ports]: score.ports,
            [NK.tiles]: score.tiles,
            [NK.days]: score.days,
            [NK.date]: date,
         }, '30000000000000', '0'),
      ],
   });
}
