import React from "react";
import Image from "next/image";
interface Token {
  id: any;
  tokenID?: string;
  contentURI?: any;
  metadataURI?: string;
  type?: string;
  meta?: any;
  mineType?: any;
}
export default async function Home() {
  const tokens = await getData();
  console.log("Fetched data; ", tokens);
  return (
    <main className="grid grid-cols-4 gap-4 px-10 py-10">
      {tokens.map((token: Token) => (
        <div
          key={token.id}
          className=" bg-gray-200 shadow-lg rounded-lg overflow-hidden "
        >
          {token.type === "video" && (
            <div className="relative p-2">
              <div
                style={{
                  width: "288px",
                  height: "320px",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                }}
              >
                <video
                  height="auto"
                  controls
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                  }}
                >
                  <source src={token.contentURI} />
                </video>
              </div>
            </div>
          )}
          {token.type === "image" && (
            <>
              <div className="flex justify-center items-center w-full h-full p-2">
                <Image
                  src={token.contentURI}
                  alt={token.type}
                  width={300}
                  height={300}
                  priority={true}
                />
              </div>
            </>
          )}
          {token.type === "audio" && (
            <>
              <audio controls>
                <source src={token.contentURI} type="audio/ogg" />
                <source src={token.contentURI} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </>
          )}
        </div>
      ))}
    </main>
  );
}
async function getData() {
  const query = `
	query {
		tokens(orderDirection: desc, orderBy: createdAtTimestamp, first: 10) {
			id
			tokenID
			contentURI
			metadataURI
		}
	}
`;
  let data = await fetch(
    "https://api.studio.thegraph.com/query/52298/zora/version/latest",
    {
      method: "POST",
      body: JSON.stringify({
        query: query,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 10,
      },
    }
  ).then((res) => res.json());

  let tokenData = await Promise.all(
    data.data.tokens.map(async (token: any) => {
      let meta;
      try {
        const metaData = await fetch(token.metadataURI);
        let response = await metaData.json();
        meta = response;
        if (!meta) return;
        if (meta.mimeType.includes("video")) {
          token.type = "video";
        } else if (meta.mimeType.includes("wav")) {
          token.type = "audio";
        } else {
          token.type = "image";
        }
        token.meta = meta;
      } catch (err) {}
      return token;
    })
  );
  return tokenData;
}
