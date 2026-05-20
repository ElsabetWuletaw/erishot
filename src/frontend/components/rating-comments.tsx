"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ratingSummary } from "@/frontend/content/portfolio-content";
import type { PortfolioReview } from "@/shared/admin-types";

type RatingCommentsProps = {
  averageRating: number;
  reviewCount: number;
  reviews: PortfolioReview[];
};

type ReviewResponse = {
  summary?: RatingCommentsProps;
  error?: string;
};

function RatingStars({
  count,
  onSelect,
  selected
}: {
  count: number;
  onSelect?: (rating: number) => void;
  selected?: number;
}) {
  return (
    <div className="flex gap-1" aria-label={`${count} out of 5 rating`}>
      {Array.from({ length: count }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect?.(index + 1)}
          className={`h-4 w-4 [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)] ${
            selected === undefined || index < selected
              ? "bg-gold"
              : "bg-white/18"
          }`}
          aria-label={`${index + 1} star rating`}
        />
      ))}
    </div>
  );
}

function formatReviewDate(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export function RatingComments({
  averageRating,
  reviewCount,
  reviews
}: RatingCommentsProps) {
  const [summary, setSummary] = useState<RatingCommentsProps>({
    averageRating,
    reviewCount,
    reviews
  });
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(5);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roundedAverage = Math.max(1, Math.round(summary.averageRating));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/portfolio/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          rating,
          note
        })
      });
      const payload = (await response.json().catch(() => ({}))) as ReviewResponse;

      if (!response.ok || !payload.summary) {
        throw new Error(payload.error ?? "Could not save your rating.");
      }

      setSummary(payload.summary);
      setName("");
      setNote("");
      setRating(5);
      setNotice("Your rating was saved.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Could not save your rating."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-ink px-5 py-16 text-white sm:px-8 lg:py-24">
      <motion.div
        className="mx-auto grid max-w-7xl gap-12 border-y border-white/10 py-12 lg:grid-cols-[0.34fr_0.66fr]"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div>
          <p className="text-[0.65rem] font-black uppercase text-gold">
            {ratingSummary.label}
          </p>
          <div className="mt-6 flex flex-wrap items-end gap-3">
            <p className="text-5xl font-black leading-none text-white">
              {summary.averageRating.toFixed(1)}
            </p>
            <div className="pb-1">
              <RatingStars count={ratingSummary.maxRating} selected={roundedAverage} />
            </div>
          </div>
          <p className="mt-4 text-[0.65rem] font-black uppercase text-white/40">
            {summary.reviewCount
              ? `${summary.reviewCount} portfolio ratings`
              : ratingSummary.detail}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-black uppercase text-white sm:text-2xl">
            Editorial Notes
          </h2>

          <div className="mt-9 space-y-8">
            {summary.reviews.map((review) => (
              <article
                key={review.id}
                className="grid gap-3 border-b border-white/10 pb-7 last:border-b-0"
              >
                <div className="flex flex-col gap-2 text-[0.65rem] font-black uppercase text-white/50 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-white">{review.name}</p>
                  <div className="flex items-center gap-3">
                    <RatingStars count={ratingSummary.maxRating} selected={review.rating} />
                    <p>{formatReviewDate(review.createdAt)}</p>
                  </div>
                </div>
                <p className="max-w-3xl text-sm font-bold leading-6 text-white/70">
                  {review.note}
                </p>
              </article>
            ))}
          </div>

          <form
            className="mt-8 grid gap-3 border border-white/10 bg-white/[0.035] p-3 sm:grid-cols-[0.7fr_1fr_auto]"
            onSubmit={handleSubmit}
          >
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="YOUR NAME"
              className="min-w-0 bg-transparent px-3 py-3 text-[0.68rem] font-black uppercase text-white outline-none placeholder:text-white/30"
            />
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="ADD A NOTE..."
              className="min-w-0 bg-transparent px-3 py-3 text-[0.68rem] font-black uppercase text-white outline-none placeholder:text-white/30"
            />
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <RatingStars
                count={ratingSummary.maxRating}
                selected={rating}
                onSelect={setRating}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-3 text-xl font-black text-white transition hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-55"
                aria-label="Submit note"
              >
                {isSubmitting ? "..." : "\u2192"}
              </button>
            </div>

            {notice ? (
              <p className="text-sm font-bold uppercase text-gold sm:col-span-3">
                {notice}
              </p>
            ) : null}
          </form>
        </div>
      </motion.div>
    </section>
  );
}
