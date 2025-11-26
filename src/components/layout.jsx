export default function Layout({ children }) {
  return (
    <>
      <div className="flex flex-col justify-center items-center py-5 px-5 min-h-[91vh]">
        {children}
      </div>

      <footer className="text-center text-muted-foreground text-sm flex flex-col justify-center items-center mb-2">
        Realms does not host any files itself but instead only display's content
        from 3rd party providers. Legal issues should be taken up with them.
      </footer>
    </>
  );
}
