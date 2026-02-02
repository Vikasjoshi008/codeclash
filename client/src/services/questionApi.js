import api from "./api";

/* ================= GET QUESTIONS LIST ================= */
export const getQuestions = async (language, difficulty) => {
  const res = await api.get("/questions", {
    params: { language, difficulty },
  });
  return res.data;
};

/* ================= GET QUESTION BY ORDER ================= */
export const getQuestionByOrder = async (language, difficulty, order) => {
  const res = await api.get(`/questions/${order}`, {
    params: { language, difficulty },
  });
  return res.data;
};
