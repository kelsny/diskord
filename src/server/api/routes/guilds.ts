import { Router } from "express";
import { ObjectId } from "mongodb";
import { AUTHENTICATE, DEFAULT_ICON } from "../../constants";
import channels from "../../database/models/channel";
import { default as __guilds__ } from "../../database/models/guild";
import members from "../../database/models/member";
import users from "../../database/models/user";

const guilds = Router();

guilds.use(AUTHENTICATE);

guilds.put("/new", async (req, res) => {
    const { name } = req.body;

    const user = (await users.findOne({
        //@ts-ignore
        email: req.user.email,
    }))!;

    if (user.guilds.length >= 100)
        return res.status(403).json({
            message: "You are in 100 guilds. Leave one to create a guild.",
        });

    if (!name)
        return res.status(400).json({
            message: "No name was provided.",
        });

    if (name.length > 64)
        return res.status(400).json({
            message: "Names can't be more than 64 characters long.",
        });

    const guild = await __guilds__.create({
        owner: user._id,
        members: [user._id],
        name,
        icon: DEFAULT_ICON,
    });

    const channel = await channels.create({
        name: "general",
        guild: guild._id,
    });

    guild.channels.push(channel);

    await guild.save();

    return res.status(200).json({
        message: "New guild created.",
    });
});

guilds.post("/join", async (req, res) => {
    // ! Join guild
});

guilds.patch("/leave", async (req, res) => {
    // ! Leave guild
});

guilds.delete("/delete", async (req, res) => {
    const { id } = req.body;

    if (!id)
        return res.status(400).json({
            message: "No ID was provided.",
        });

    if (!ObjectId.isValid(id))
        return res.status(400).json({
            message: "Invalid ID.",
        });

    const guild = await __guilds__.findById(id);

    if (guild) {
        //@ts-ignore
        if (guild.owner !== req.user!._id)
            return res.status(403).json({
                message: "You aren't the owner.",
            });

        await Promise.all(
            guild.members.map(async (id) => {
                const u = await users.findById(id);
                const m = await members.findById(id);

                if (m) await m.delete();

                if (u) {
                    u.guilds = u.guilds.filter((g) => g !== id);

                    await u.save();
                }
            })
        );

        await Promise.all(guild.roles.map((r) => r.delete()));
        await Promise.all(guild.channels.map((c) => c.delete()));

        await guild.delete();
    }

    return res.status(200).json({
        message: "Guild was deleted.",
    });
});

export default guilds;
