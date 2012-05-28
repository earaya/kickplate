# Require any additional compass plugins here.

# Set this to the root of your project when deployed:
http_fonts_dir = "fnt"
output_style = (environment == :production) ? :compressed : :expanded
css_dir = "../public/css"
sass_dir = "../src/scss"
images_dir = "../src/images"
javascripts_dir = "../src/scripts"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass