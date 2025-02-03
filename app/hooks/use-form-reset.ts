import { useEffect, useRef } from "react";

export const useFormReset = (isSubmitting: boolean) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isSubmitting && formRef.current) {
      formRef.current.reset();
    }
  }, [isSubmitting]);

  return formRef;
};
