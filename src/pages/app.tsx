import { ObjectId } from "mongodb";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import Documentation from "../components/docs";
import Main from "../components/main";
import Meta from "../components/meta";
import Servers from "../components/servers";
import { IChannel } from "../server/database/models/channel";
import guilds, { IGuild } from "../server/database/models/guild";
import { IUser } from "../server/database/models/user";

// ! fix scrolling

export default function DiskordApp({ user, guilds }: { user: IUser; guilds: { name: string; icon: string; id: string }[] }) {
    const [currentGuildId, setCurrentGuildId] = useState("");
    const [currentChannelId, setCurrentChannelId] = useState("");
    const [currentGuild, setCurrentGuild] = useState<IGuild | undefined>(undefined);
    const [currentChannel, setCurrentChannel] = useState<IChannel | undefined>(undefined);

    useEffect(() => {
        if (currentGuildId) {
        }
    }, [currentGuildId]);

    useEffect(() => {
        if (currentChannelId) {
        }
    }, [currentChannelId]);

    return (
        <div>
            <Meta />
            <Head>
                <title>diskord</title>
            </Head>
            <div className="root">
                <Servers guilds={guilds} setGuild={setCurrentGuildId} setChannel={setCurrentChannelId} />
                {!currentGuildId && !currentChannelId ? <Documentation /> : <Main user={user} />}
            </div>
            <style jsx>{`
                .root {
                    min-height: 100vh;
                    display: flex;
                }
            `}</style>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    return {
        props: {
            //@ts-ignore
            user: JSON.parse(JSON.stringify(ctx.req.user)),
            guilds: await guilds.find({
                _id: {
                    //@ts-ignore
                    $in: ctx.req.user.guilds.map((id) => ObjectId(id)),
                },
            }),
        },
    };
};
