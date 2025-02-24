import { Component, ElementRef, ViewChild, AfterViewChecked, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // For HTML, XML, SVG etc.
import 'prismjs/components/prism-sql';
// ... import other language grammars as needed
declare var Prism: any;

@Component({
    selector: 'app-code-commenter',
    standalone: true,
    imports: [FormsModule, CommonModule, HttpClientModule],
    templateUrl: './code-commentor.component.html',
    styleUrl: './code-commentor.component.css'
})
export class CodeCommenterComponent implements AfterViewChecked, OnInit {
    code: string = '';
    level: string = '3';
    result: string = '';
    isLoading: boolean = false;
    copied: boolean = false;
    errorMessage: string = '';
    geminiApiKey: string = 'YOUR_GEMINI_API_KEY';
    language: string = 'javascript'; // Default language for highlighting
    languageOptions: string[] = ['javascript', 'python', 'java', 'cpp', 'csharp', 'typescript', 'go', 'css', 'html', 'sql', 'auto']; // Language choices

    levelPrompts: { [key: string]: string } = {
        '1': "Add basic comments explaining the main purpose of the code. Keep it simple and brief.",
        '2': "Add moderate comments explaining the code's purpose and main functions. Include some implementation details.",
        '3': "Add detailed comments explaining the code's purpose, functions, and implementation details. Include parameter explanations.",
        '4': "Add comprehensive comments including purpose, functions, implementation details, parameters, logic explanations, and brief explanations of the logic.",
        '5': "Add extensive comments including purpose, functions, implementation details, parameters, logic explanations, and potential edge cases/considerations.",
    };

    @ViewChild('codeDisplay', { static: false }) codeDisplayElement!: ElementRef;

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        // You can set a default language or load settings on component initialization if needed
    }

    ngAfterViewChecked(): void {
        this.highlightCode();
    }

    private highlightCode() {
        if (this.codeDisplayElement && this.result) {
            Prism.highlightElement(this.codeDisplayElement.nativeElement);
        }
    }

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

        this.callGeminiAPI(prompt).then(commentedCode => {
            this.result = commentedCode;
            // Highlighting will be done in ngAfterViewChecked
            this.isLoading = false;
        }).catch(error => {
            console.error("Error:", error);
            this.errorMessage = "Failed to generate comments from Gemini API. Please try again.";
            this.isLoading = false;
        });
    }


    async callGeminiAPI(prompt: string): Promise<string> {
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;
        const requestBody = {
            "contents": [{ "parts": [{ "text": prompt }] }]
        };

        try {
            const response = await this.http.post<any>(apiEndpoint, requestBody).toPromise();
            if (response && response.candidates && response.candidates[0].content && response.candidates[0].content.parts[0].text) {
                return response.candidates[0].content.parts[0].text;
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