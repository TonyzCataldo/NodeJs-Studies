import { useState } from "react";
import { COURSES, Course, Subject } from "../data/filter-data";
import { createBookAction } from "../app/actions/questions";
import { useRouter } from "next/navigation";

export function useFilter() {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [amount, setAmount] = useState<number>(10);
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedCourse: Course | undefined = COURSES.find(
    (c) => c.id === selectedCourseId
  );

  const availableSubjects: Subject[] = selectedCourse?.subjects || [];

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedSubjectId("");
  };

  const mapFilterToApi = (type: string) => {
    switch (type) {
      case "unanswered":
        return { done: false };
      case "answered":
        return { done: true };
      case "correct":
        return { done: true, correct: true };
      case "incorrect":
        return { done: true, correct: false };
      case "all":
      default:
        return {};
    }
  };

  const handleCreateNotebook = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const filterParams = mapFilterToApi(filterType);

    const payload = {
      courseId: selectedCourseId,
      subjectId: selectedSubjectId,
      limit: amount,
      ...filterParams,
    };

    const result = await createBookAction(payload);

    if (result.success) {
      console.log("Session Created!", result.data);
      router.push("/dashboard/caderno");
    } else {
      setErrorMessage(result.error || "Erro ao criar caderno");
      console.error(result.error);
    }

    setIsLoading(false);
  };

  return {
    // State
    selectedCourseId,
    selectedSubjectId,
    amount,
    filterType,
    isLoading,
    errorMessage,
    // Derived Data
    availableSubjects,
    selectedCourse,
    // Actions
    setAmount,
    setFilterType,
    setSelectedSubjectId,
    handleCourseChange,
    handleCreateNotebook,
  };
}
