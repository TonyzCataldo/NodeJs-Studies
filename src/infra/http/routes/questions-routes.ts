import { FastifyInstance } from "fastify";
import { CreateUserBookController } from "../../../modules/questions/controllers/create-user-book";

import { GetUserBookController } from "../../../modules/questions/controllers/get-user-book";
import { AnswerQuestionController } from "../../../modules/questions/controllers/answer-question";
import { FinishUserBookController } from "../../../modules/questions/controllers/finish-user-book";

export async function questionsRoutes(app: FastifyInstance) {
  app.post(
    "/session",
    { onRequest: [app.authenticate] },
    CreateUserBookController
  );

  app.get(
    "/session/current",
    { onRequest: [app.authenticate] },
    GetUserBookController
  );

  app.post(
    "/answer",
    { onRequest: [app.authenticate] },
    AnswerQuestionController
  );

  app.post(
    "/session/finish",
    { onRequest: [app.authenticate] },
    FinishUserBookController
  );

  app.get("/questions", async (request, reply) => {
    return reply.send({ message: "Questions route working" });
  });
}
