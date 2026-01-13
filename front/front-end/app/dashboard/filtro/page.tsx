"use client";

import { useFilter } from "@/hooks/useFilter";
import { COURSES, QUESTION_AMOUNTS, FILTER_TYPES } from "@/data/filter-data";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function FilterPage() {
  const {
    selectedCourseId,
    selectedSubjectId,
    amount,
    filterType,
    handleCourseChange,
    setSelectedSubjectId,
    setAmount,
    setFilterType,
    handleCreateNotebook,
    availableSubjects,
    isLoading,
    errorMessage,
  } = useFilter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerar Simulado</h1>
          <p className="text-gray-500">
            Configure seu caderno de questões personalizado.
          </p>
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Curso Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Curso / Concurso
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none"
            >
              <option value="" disabled>
                Selecione um curso
              </option>
              {COURSES.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Matéria Selection (Dependent) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Matéria
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={!selectedCourseId}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="" disabled>
                {selectedCourseId
                  ? "Selecione uma matéria"
                  : "Selecione um curso primeiro"}
              </option>
              {availableSubjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quantidade Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Quantidade de Questões
            </label>
            <div className="grid grid-cols-4 gap-3">
              {QUESTION_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className={`
                    h-10 rounded-lg border text-sm font-medium transition-all
                    ${
                      amount === q
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }
                  `}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de Questão (Radio Buttons) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Status da Questão
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FILTER_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFilterType(type.id)}
                  className={`
                    px-3 py-2 rounded-lg border text-sm font-medium transition-all text-center
                    ${
                      filterType === type.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedCourseId || !selectedSubjectId || isLoading}
          onClick={handleCreateNotebook}
        >
          {isLoading ? "Criando Caderno..." : "Criar Caderno"}
        </Button>
      </Card>
    </div>
  );
}
