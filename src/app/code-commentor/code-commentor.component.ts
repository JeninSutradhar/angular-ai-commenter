import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClient and HttpClientModule

@Component({
    selector: 'app-code-commenter',
    standalone: true,
    imports: [FormsModule, MarkdownModule, CommonModule, HttpClientModule], // Include HttpClientModule in imports
    templateUrl: './code-commentor.component.html',
    styleUrl: './code-commentor.component.css'
})
export class CodeCommenterComponent {
    code: string = '';
    level: string = '3';
    result: string = '';
    isLoading: boolean = false;
    copied: boolean = false;
    errorMessage: string = '';
    geminiApiKey: string = 'YOUR_API_KEY_HERE'; // Placeholder, will replace with your key

    levelPrompts: { [key: string]: string } = {
        '1': "Add basic comments explaining the main purpose of the code. Keep it simple and brief.",
        '2': "Add moderate comments explaining the code's purpose and main functions. Include some implementation details.",
        '3': "Add detailed comments explaining the code's purpose, functions, and implementation details. Include parameter explanations.",
        '4': "Add comprehensive comments including purpose, functions, implementation details, parameters, and brief explanations of the logic.",
        '5': "Add extensive comments including purpose, functions, implementation details, parameters, logic explanations, and potential edge cases/considerations.",
    };

    constructor(private http: HttpClient) { } // Inject HttpClient

    async handleSubmit() {
        if (!this.code.trim()) {
            this.errorMessage = "Please enter some code to comment";
            return;
        }
        this.errorMessage = '';
        this.isLoading = true;
        this.result = '';
        this.copied = false;

        const prompt = `
      You are a professional code commenter. Please add comments to the following code.
      Comment Level Instructions: ${this.levelPrompts[this.level]}

      Important Guidelines:
      1. Keep comments clear and concise
      2. Use proper comment syntax for the programming language
      3. Add comments before functions/blocks to explain their purpose
      4. Include parameter and return value descriptions where applicable
      5. Maintain consistent comment style throughout
      6. For complex logic, explain the reasoning
      7. If the code language is detected, use its standard comment format

      Here's the code to comment:
      ${this.code}

      Please return only the commented code without any additional explanations.
      Ensure proper formatting and indentation is maintained.
    `;

        // **Using Actual Gemini API Now**
        this.callGeminiAPI(prompt).then(commentedCode => {
            this.result = commentedCode;
            this.isLoading = false;
        }).catch(error => {
            console.error("Error:", error);
            this.errorMessage = "Failed to generate comments from Gemini API. Please try again.";
            this.isLoading = false;
        });
    }


    async callGeminiAPI(prompt: string): Promise<string> {
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`; // Use API Key
        const requestBody = {
            "contents": [{ "parts": [{ "text": prompt }] }]
        };

        try {
            const response = await this.http.post<any>(apiEndpoint, requestBody).toPromise(); // Using HttpClient to post
            if (response && response.candidates && response.candidates[0].content && response.candidates[0].content.parts[0].text) {
                return response.candidates[0].content.parts[0].text; // Extracting text from the API response
            } else {
                throw new Error('Unexpected API response format');
            }
        } catch (error: any) {
            console.error('Gemini API Error:', error);
            throw new Error(`Failed to call Gemini API: ${error.message}`);
        }
    }


    async copyToClipboard() {
        if (this.result) {
            try {
                await navigator.clipboard.writeText(this.result);
                this.copied = true;
                setTimeout(() => {
                    this.copied = false;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
                this.errorMessage = 'Failed to copy code to clipboard.';
            }
        }
    }
}