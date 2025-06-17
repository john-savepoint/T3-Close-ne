import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      prompt, 
      model = "gpt-image-1", 
      size = "1024x1024", 
      quality = "standard", 
      style = "vivid",
      response_format = "b64_json"
    } = await request.json();

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'A valid prompt is required' }, 
        { status: 400 }
      );
    }

    if (prompt.length > 4000) {
      return NextResponse.json(
        { error: 'Prompt is too long. Maximum 4000 characters allowed.' }, 
        { status: 400 }
      );
    }

    // Validate model
    const validModels = ["gpt-image-1", "dall-e-3", "dall-e-2"];
    if (!validModels.includes(model)) {
      return NextResponse.json(
        { error: `Invalid model. Supported models: ${validModels.join(', ')}` }, 
        { status: 400 }
      );
    }

    // Validate size based on model
    const validSizes = model === "dall-e-2" 
      ? ["256x256", "512x512", "1024x1024"]
      : ["1024x1024", "1792x1024", "1024x1792"]; // gpt-image-1 and dall-e-3

    if (!validSizes.includes(size)) {
      return NextResponse.json(
        { error: `Invalid size for ${model}. Supported sizes: ${validSizes.join(', ')}` }, 
        { status: 400 }
      );
    }

    // Prepare request parameters
    const requestParams: any = {
      model,
      prompt,
      size: size as "1024x1024" | "1792x1024" | "1024x1792" | "256x256" | "512x512",
      response_format: response_format as "url" | "b64_json",
      n: 1,
    };

    // Add quality and style for dall-e-3 and gpt-image-1
    if (model === "dall-e-3" || model === "gpt-image-1") {
      requestParams.quality = quality as "standard" | "hd";
      requestParams.style = style as "vivid" | "natural";
    }

    // Generate image
    const response = await openai.images.generate(requestParams);

    if (!response.data || response.data.length === 0) {
      return NextResponse.json(
        { error: 'No image data received from OpenAI' },
        { status: 500 }
      );
    }

    const imageData = response.data[0];
    
    return NextResponse.json({
      success: true,
      model: model,
      image: response_format === "b64_json" ? imageData.b64_json : imageData.url,
      revised_prompt: imageData.revised_prompt || prompt,
      size: size,
      quality: quality,
      style: style,
      created: response.created,
    });

  } catch (error: any) {
    console.error('Image Generation API Error:', error);
    
    // Handle specific OpenAI error types
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your configuration.' },
        { status: 401 }
      );
    }

    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'OpenAI API quota exceeded. Please check your usage limits.' },
        { status: 429 }
      );
    }

    if (error.code === 'rate_limit_exceeded') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.code === 'content_policy_violation') {
      return NextResponse.json(
        { error: 'Your prompt violates OpenAI content policy. Please modify your request.' },
        { status: 400 }
      );
    }

    if (error.status === 400) {
      return NextResponse.json(
        { error: error.message || 'Invalid request. Please check your parameters.' },
        { status: 400 }
      );
    }

    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Authentication failed. Please check your API key.' },
        { status: 401 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    if (error.status === 500) {
      return NextResponse.json(
        { error: 'OpenAI server error. Please try again later.' },
        { status: 500 }
      );
    }

    // Generic error handling
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Image generation API',
      supportedModels: ["gpt-image-1", "dall-e-3", "dall-e-2"],
      supportedSizes: {
        "dall-e-2": ["256x256", "512x512", "1024x1024"],
        "dall-e-3": ["1024x1024", "1792x1024", "1024x1792"],
        "gpt-image-1": ["1024x1024", "1792x1024", "1024x1792"]
      },
      supportedQuality: ["standard", "hd"],
      supportedStyles: ["vivid", "natural"]
    },
    { status: 200 }
  );
}