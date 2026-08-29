import React, { useState, useRef } from "react";
import { Send, Check, AlertTriangle } from "lucide-react";
import api, { apiErrorMessage } from "../../services/api";
import { Input, Textarea } from "../ui";
import { Button } from "../ui";

export function UniversityOnboardingForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    universityName: "",
    role: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await api.post("/contacts/university", formData);
      if (response.data?.success) {
        setStatus({
          type: "success",
          message:
            "Onboarding request received. Our partnerships team reviews every submission and will follow up by email.",
        });
        setFormData({ name: "", email: "", universityName: "", role: "", phone: "", message: "" });
      } else {
        setStatus({
          type: "error",
          message: "Submission failed. Please try again.",
        });
        statusRef.current?.focus();
      }
    } catch (error: any) {
      console.error("University contact submit failed:", error);
      setStatus({
        type: "error",
        message: apiErrorMessage(
          error,
          "Connection failed. Please check your network and try again.",
        ),
      });
      statusRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-8 rounded-2xl border border-ink-200/70 shadow-sm">
      <h3 className="text-lg font-bold text-ink-900 mb-6">University Onboarding Request</h3>

      <div ref={statusRef} tabIndex={-1}>
        {status.type === "success" && (
          <div
            role="status"
            aria-live="polite"
            className="p-4 rounded-xl text-sm font-semibold mb-6 flex items-start gap-3 border bg-success-soft text-success border-success/20"
          >
            <Check className="w-5 h-5 shrink-0" />
            <span>{status.message}</span>
          </div>
        )}
        {status.type === "error" && (
          <div
            role="alert"
            aria-live="polite"
            className="p-4 rounded-xl text-sm font-semibold mb-6 flex items-start gap-3 border bg-danger-soft text-danger border-danger/20"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{status.message}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Your Full Name"
          name="name"
          required
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Dean Henderson"
          className="text-base"
        />

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            type="email"
            label="Work Email Address"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder="henderson@wellmindly.com"
            className="text-base"
          />

          <Input
            type="tel"
            label="Phone Number (Optional)"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+971 50 123 4567"
            className="text-base"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="University / College"
            name="universityName"
            required
            value={formData.universityName}
            onChange={handleInputChange}
            placeholder="Gulf International University"
            className="text-base"
          />

          <Input
            label="Your Title / Role"
            name="role"
            required
            value={formData.role}
            onChange={handleInputChange}
            placeholder="Director of Student Affairs"
            className="text-base"
          />
        </div>

        <Textarea
          label="Message Details"
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Tell us about your campus context and how we can support you..."
          className="text-base"
        />

        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            loading={loading}
            loadingLabel="Submitting request"
            leadingIcon={<Send className="w-4 h-4" />}
          >
            Submit Request
          </Button>
        </div>
      </form>
    </div>
  );
}
