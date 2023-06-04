import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server';

//import { ChatBody, Message } from '@/types/chat';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';

import { parse } from 'url';

export const config = {
  runtime: 'edge',
};

interface Message {
    message: string
}

const handler = async (req: Request): Promise<Response> => {
  try {
    console.log("request query" + req.url)
    const { chain } = parse(req.url, true).query;
    console.log(chain)
    const { message } = (await req.json()) as Message;

    // await init((imports) => WebAssembly.instantiate(wasm, imports));
    // const encoding = new Tiktoken(
    //   tiktokenModel.bpe_ranks,
    //   tiktokenModel.special_tokens,
    //   tiktokenModel.pat_str,
    // );

    // let promptToSend = prompt;
    // if (!promptToSend) {
    //   promptToSend = DEFAULT_SYSTEM_PROMPT;
    // }

    // let temperatureToUse = temperature;
    // if (temperatureToUse == null) {
    //   temperatureToUse = DEFAULT_TEMPERATURE;
    // }

    // const prompt_tokens = encoding.encode(promptToSend);

    // let tokenCount = prompt_tokens.length;
    // let messagesToSend: Message[] = [];

    // for (let i = messages.length - 1; i >= 0; i--) {
    //   const message = messages[i];
    //   const tokens = encoding.encode(message.content);

    //   if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
    //     break;
    //   }
    //   tokenCount += tokens.length;
    //   messagesToSend = [message, ...messagesToSend];
    // }

    // encoding.free();

    //const stream = await OpenAIStream(model, promptToSend, temperatureToUse, key, messagesToSend);

    const body = JSON.stringify({ message })

    const response = await fetch(`http://127.0.0.1:8000/chains/${chain}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body
        });

    if (!response.body) {
        throw new Error('Streaming not supported');
        }
    
    const stream = response.body;

    return new Response(
      new ReadableStream({
        async start(controller) {
          const reader = stream.getReader();

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              controller.close();
              break;
            }

            controller.enqueue(value);
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    } catch (error) {
      console.error(error);
      if (error instanceof OpenAIError) {
        return new Response('Error', { status: 500, statusText: error.message });
      } else {
        return new Response('Error', { status: 500 });
      }
    }
};

export default handler;
