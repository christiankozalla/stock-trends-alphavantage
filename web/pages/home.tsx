import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

interface HomeProps { name: string }

const Home = ({ name }: HomeProps) => {
    return <div>Hello {name}!</div>
}

export const HomePage = ({ name }: HomeProps) => renderToStaticMarkup(<Home name={name} />)