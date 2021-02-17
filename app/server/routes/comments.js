const express = require("express");
const { PrismaClient } = require("@prisma/client");
const collection = require("lodash/collection");
const {
  populateAuditColumnsCreate,
  populateAuditColumnsUpdate,
} = require("../utilities/auditing");
const comment = require("../models/comment");

const prisma = new PrismaClient();
const router = express.Router();

async function fetchComments(licenceId) {
  return prisma.mal_licence_comment.findMany({
    where: {
      licence_id: licenceId,
    },
    orderBy: [
      {
        create_timestamp: "asc",
      },
    ],
  });
}

async function createComment(payload) {
  return prisma.mal_licence_comment.create({
    data: payload,
  });
}

async function updateComment(id, payload) {
  return prisma.mal_licence_comment.update({
    data: payload,
    where: {
      id: id,
    },
    include: {
      mal_licence: true,
    },
  });
}

async function deleteComment(id) {
  return prisma.mal_licence_comment.delete({
    where: {
      id: id,
    },
  });
}

router.get("/:licenceId(\\d+)", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);

  await fetchComments(licenceId)
    .then((records) => {
      if (records === null) {
        return res.send(null);
      }

      return res.send(collection.sortBy(records, (r) => r.create_timestamp));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/delete/:licenceId(\\d+)/:id(\\d+)", async (req, res, next) => {
  const licenceId = parseInt(req.params.licenceId, 10);
  const id = parseInt(req.params.id, 10);

  await deleteComment(id)
    .then(async () => {
      return res.status(200).send(await fetchComments(licenceId));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.put("/:commentId(\\d+)", async (req, res, next) => {
  const commentId = parseInt(req.params.commentId, 10);

  const now = new Date();

  const commentPayload = comment.convertToPhysicalModel(
    populateAuditColumnsUpdate(req.body, now, now)
  );

  await updateComment(commentId, commentPayload)
    .then(async () => {
      return res.status(200).send(await fetchComments(req.body.licenceId));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

router.post("/", async (req, res, next) => {
  const now = new Date();

  const commentPayload = comment.convertToPhysicalModel(
    populateAuditColumnsCreate(req.body, now, now)
  );

  await createComment(commentPayload)
    .then(async () => {
      return res.status(200).send(await fetchComments(req.body.licenceId));
    })
    .catch(next)
    .finally(async () => prisma.$disconnect());
});

module.exports = { router: router, createComment: createComment };
