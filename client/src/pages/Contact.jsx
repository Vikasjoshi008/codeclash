import React from "react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Contact
        </h1>

        <p className="mt-4 text-slate-400">
          Have a question, found a bug, or want to collaborate on CodeClash?
          Send a message and I will get back to you.
        </p>

        <form className="mt-10 space-y-6">
          <div>
            <label className="block text-sm mb-2 text-slate-400">Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-slate-400">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-slate-400">Message</label>
            <textarea
              rows="5"
              placeholder="Write your message..."
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-3 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 py-3 font-semibold text-white hover:opacity-90 transition"
          >
            Send Message
          </button>
        </form>

        <div className="mt-10 text-sm text-slate-500">
          You can also reach out via GitHub or email if you prefer. Thank you!
        </div>
      </div>
    </div>
  );
};

export default Contact;
