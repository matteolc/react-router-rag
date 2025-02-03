import { useEffect, useState } from "react";
import { useFetchers } from "react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

const AlertModal = () => {
  const fetchers = useFetchers();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  // Friendly error mappings
  const errorMap = {
    "Database connection error": "We're having trouble connecting to our servers. Please try again later.",
    "Invalid login credentials": "The email or password you entered is incorrect. Please try again.",
    "Too many requests": "Too many attempts. Please wait a moment and try again.",
    "Internal server error": "Something went wrong on our end. Our team has been notified and we're working on it!"
  };

  useEffect(() => {
    if (fetchers.length > 0) {
      const errorFetcher = fetchers.find(fetcher => fetcher.data?.error);
      if (errorFetcher) {
        const serverError = errorFetcher.data.error as keyof typeof errorMap;
        // Map technical error to friendly message, fallback to generic message
        const friendlyMessage = errorMap[serverError] || 
          "Something went wrong. Please try again later.";
        setMessage(friendlyMessage);
        setIsOpen(true);
      }
    }
  }, [fetchers]);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Oops! Something went wrong</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
            <p className="mt-2 text-sm">
              Need help? Contact support at{" "}
              <a href="mailto:help@example.com" className="text-primary underline">
                help@example.com
              </a>
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Try Again</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { AlertModal };
