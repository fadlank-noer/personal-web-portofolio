<script context="module" lang="ts">
  // Declare grecaptcha on the window object
  declare global {
    interface Window {
      grecaptcha: {
        ready: (callback: () => void) => void;
        execute: (sitekey: string, options: { action: string }) => Promise<string>;
        render: (element: HTMLElement, options: { sitekey: string; theme?: string }) => void;
        getResponse: () => string;
        reset: () => void;
      };
    }
  }
</script>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  // reCAPTCHA v3 site key from environment variables
  const RECAPTCHA_SITE_KEY = import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY;
  
  interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
  }

  let formData: FormData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  let isSubmitting = false;
  let isSubmitted = false;
  let errors: Partial<FormData> = {};
  let showSuccess = false;
  let recaptchaError = '';

  // Animation states
  let mounted = false;
  let focusedField = '';

  // reCAPTCHA state
  let recaptchaLoaded = false;
  let recaptchaToken = '';

  onMount(() => {
    mounted = true;
    loadRecaptcha();
  });

  // Clean up reCAPTCHA script when component is destroyed
  onDestroy(() => {
    const recaptchaScript = document.querySelector('script[src^="https://www.google.com/recaptcha/api.js"]');
    if (recaptchaScript) {
      document.head.removeChild(recaptchaScript);
    }
  });

  // Load reCAPTCHA v3 script
  const loadRecaptcha = () => {
    if (!RECAPTCHA_SITE_KEY) {
      console.error('reCAPTCHA site key is not configured');
      recaptchaError = 'reCAPTCHA is not properly configured. Please contact the site administrator.';
      return;
    }

    // Check if script is already loaded
    if (window.grecaptcha) {
      recaptchaLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.onload = () => {
      recaptchaLoaded = true;
    };
    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
      recaptchaError = 'Failed to load reCAPTCHA. Please refresh the page and try again.';
    };
    document.head.appendChild(script);
  };

  // Get reCAPTCHA response token
  const getRecaptchaToken = async (): Promise<string> => {
    if (!recaptchaLoaded || !window.grecaptcha) {
      throw new Error('reCAPTCHA not loaded');
    }

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' })
          .then(token => {
            resolve(token);
          })
          .catch(error => {
            console.error('reCAPTCHA execution error:', error);
            reject(new Error('Failed to execute reCAPTCHA. Please try again.'));
          });
      });
    });
  };

  const validateField = (field: keyof FormData, value: string) => {
    switch (field) {
      case 'name':
        return value.length < 2 ? 'Name must be at least 2 characters' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      case 'subject':
        return value.length < 3 ? 'Subject must be at least 3 characters' : '';
      case 'message':
        return value.length < 10 ? 'Message must be at least 10 characters' : '';
      default:
        return '';
    }
  };

  const handleInput = (field: keyof FormData, value: string) => {
    formData[field] = value;
    errors[field] = validateField(field, value);
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    
    // Reset reCAPTCHA error
    recaptchaError = '';
    
    // Validate all fields
    const newErrors: Partial<FormData> = {};
    Object.keys(formData).forEach(key => {
      const field = key as keyof FormData;
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    errors = newErrors;

    if (Object.keys(errors).length > 0) {
      return;
    }

    isSubmitting = true;

    try {
      // Get reCAPTCHA token
      let token = '';
      try {
        token = await getRecaptchaToken();
      } catch (error) {
        console.error('reCAPTCHA token error:', error);
        recaptchaError = error instanceof Error ? error.message : 'reCAPTCHA verification failed. Please try again.';
        return;
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: token
        })
      });

      const result = await res.json().catch(() => ({ ok: false, error: 'Invalid server response' }));

      if (!res.ok || !result?.ok) {
        // Check if the error is related to reCAPTCHA
        if (result?.error && result.error.includes('reCAPTCHA')) {
          recaptchaError = result.error;
        } else {
          recaptchaError = result?.error || 'Failed to send message. Please try again.';
        }
        return;
      }

      isSubmitted = true;
      showSuccess = true;

      // Reset form after success
      setTimeout(() => {
        formData = { name: '', email: '', subject: '', message: '' };
        isSubmitted = false;
        showSuccess = false;
      }, 3000);

    } catch (error) {
      console.error('Submission error:', error);
      recaptchaError = 'An unexpected error occurred. Please try again later.';
    } finally {
      isSubmitting = false;
    }
  };

  const handleFocus = (field: string) => {
    focusedField = field;
  };

  const handleBlur = () => {
    focusedField = '';
  };
</script>

<div id="anchor-contact" class="w-screen min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-x-hidden py-12 md:py-16 px-4 md:px-10">
  <div class="container mx-auto max-w-4xl">
    <!-- Header -->
    <div class="text-center mb-12 md:mb-16" class:animate-fade-in={mounted}>
      <i class="text-2xl md:text-3xl text-purple-300">Get In Touch</i>
      <h2 class="text-4xl md:text-6xl font-bold my-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
        Contact Me
      </h2>
      <p class="text-base md:text-xl text-purple-200 max-w-2xl mx-auto">
        Ready to start your next project? Let's discuss how we can work together.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Contact Info -->
      <div class="space-y-8" class:animate-slide-in-left={mounted}>
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
          <h3 class="text-2xl font-bold text-white mb-6">Let's Connect</h3>
          
          <div class="space-y-6">
            <!-- Email -->
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <p class="text-purple-200 text-sm">Email</p>
                <a href="mailto:fadlank.noer@gmail.com" class="text-white hover:text-purple-300 transition-colors">
                  fadlank.noer@gmail.com
                </a>
              </div>
            </div>

            <!-- WhatsApp -->
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
              <div>
                <p class="text-purple-200 text-sm">WhatsApp</p>
                <a href="https://api.whatsapp.com/send?phone=62895352837926&text=Hai%20Dlan%2C%20Aku%20datang%20dari%20Website-Mu!" 
                   class="text-white hover:text-purple-300 transition-colors" target="_blank" rel="noopener noreferrer">
                  +62 895-3528-37926
                </a>
              </div>
            </div>

            <!-- Location -->
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-purple-200 text-sm">Location</p>
                <p class="text-white">Jakarta, Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20" class:animate-slide-in-right={mounted}>
        <form on:submit={handleSubmit} class="space-y-6">
          <!-- Name Field -->
          <div class="form-group">
            <label for="name" class="block text-sm font-medium text-purple-200 mb-2">
              Full Name *
            </label>
            <div class="relative">
              <input
                type="text"
                id="name"
                bind:value={formData.name}
                on:input={(e) => handleInput('name', (e.target as HTMLInputElement)?.value || '')}
                on:focus={() => handleFocus('name')}
                on:blur={handleBlur}
                class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                class:focused={focusedField === 'name'}
                class:error={errors.name}
                placeholder="Your full name"
                required
              />
              {#if focusedField === 'name'}
                <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10 animate-pulse"></div>
              {/if}
            </div>
            {#if errors.name}
              <p class="text-red-400 text-sm mt-1 animate-shake">{errors.name}</p>
            {/if}
          </div>

          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="block text-sm font-medium text-purple-200 mb-2">
              Email Address *
            </label>
            <div class="relative">
              <input
                type="email"
                id="email"
                bind:value={formData.email}
                on:input={(e) => handleInput('email', (e.target as HTMLInputElement)?.value || '')}
                on:focus={() => handleFocus('email')}
                on:blur={handleBlur}
                class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                class:focused={focusedField === 'email'}
                class:error={errors.email}
                placeholder="your.email@example.com"
                required
              />
              {#if focusedField === 'email'}
                <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10 animate-pulse"></div>
              {/if}
            </div>
            {#if errors.email}
              <p class="text-red-400 text-sm mt-1 animate-shake">{errors.email}</p>
            {/if}
          </div>

          <!-- Subject Field -->
          <div class="form-group">
            <label for="subject" class="block text-sm font-medium text-purple-200 mb-2">
              Subject *
            </label>
            <div class="relative">
              <input
                type="text"
                id="subject"
                bind:value={formData.subject}
                on:input={(e) => handleInput('subject', (e.target as HTMLInputElement)?.value || '')}
                on:focus={() => handleFocus('subject')}
                on:blur={handleBlur}
                class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                class:focused={focusedField === 'subject'}
                class:error={errors.subject}
                placeholder="Project discussion, collaboration, etc."
                required
              />
              {#if focusedField === 'subject'}
                <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10 animate-pulse"></div>
              {/if}
            </div>
            {#if errors.subject}
              <p class="text-red-400 text-sm mt-1 animate-shake">{errors.subject}</p>
            {/if}
          </div>

          <!-- Message Field -->
          <div class="form-group">
            <label for="message" class="block text-sm font-medium text-purple-200 mb-2">
              Message *
            </label>
            <div class="relative">
              <textarea
                id="message"
                bind:value={formData.message}
                on:input={(e) => handleInput('message', (e.target as HTMLTextAreaElement)?.value || '')}
                on:focus={() => handleFocus('message')}
                on:blur={handleBlur}
                rows="5"
                class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                class:focused={focusedField === 'message'}
                class:error={errors.message}
                placeholder="Tell me about your project, requirements, timeline, etc."
                required
              ></textarea>
              {#if focusedField === 'message'}
                <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10 animate-pulse"></div>
              {/if}
            </div>
            {#if errors.message}
              <p class="text-red-400 text-sm mt-1 animate-shake">{errors.message}</p>
            {/if}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            disabled={isSubmitting || isSubmitted}
            class="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            class:animate-bounce={isSubmitting}
          >
            {#if isSubmitting}
              <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Message...
              </span>
            {:else if isSubmitted}
              <span class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Message Sent!
              </span>
            {:else}
              Send Message
            {/if}
          </button>
        </form>

        <!-- Success Message -->
        {#if showSuccess}
          <div class="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg animate-fade-in">
            <p class="text-green-300 text-center">
              🎉 Thank you for your message! I'll get back to you soon.
            </p>
          </div>
        {/if}
        
        <!-- reCAPTCHA Error Message -->
        {#if recaptchaError}
          <div class="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg animate-fade-in">
            <p class="text-red-300 text-center">
              ⚠️ {recaptchaError}
            </p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .animate-fade-in {
    animation: fadeIn 0.8s ease-out;
  }

  .animate-slide-in-left {
    animation: slideInLeft 0.8s ease-out;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.8s ease-out;
  }

  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }

  .focused {
    transform: scale(1.02);
  }

  .error {
    border-color: #ef4444 !important;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
</style>
