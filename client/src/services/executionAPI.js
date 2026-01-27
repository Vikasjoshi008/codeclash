import api from "./api";

export const runCode = async (code, questionId, language) => {
  const res = await api.post("/execute", {
    code,
    questionId,
    language,
  });
  return res.data;
};
