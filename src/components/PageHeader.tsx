type PageHeaderProps = {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-5 sm:mb-6">
      <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-600 sm:mt-2">
        {description}
      </p>
    </div>
  )
}
